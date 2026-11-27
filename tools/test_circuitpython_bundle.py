# (c) 2026, Micro:bit Educational Foundation and contributors
# SPDX-License-Identifier: MIT
"""Offline A/B bundle tests; no upstream or editor releases are required."""
import base64
import importlib.util
import io
import json
from pathlib import Path
import stat
import tempfile
import unittest
import zipfile

from circuitpython_bundle import artifact_majors, digest, discover_bundles, discover_inputs, publish, validate_output

spec = importlib.util.spec_from_file_location("prepare", Path(__file__).with_name("prepare-circuitpython-libraries.py"))
prepare = importlib.util.module_from_spec(spec)
spec.loader.exec_module(prepare)


def archive(files):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w") as target:
        for name, data in files.items():
            target.writestr(name, data)
    return stream.getvalue()


class Bundles(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name)
        self.addCleanup(self.temporary.cleanup)

    def generate(self, release, version="A", firmware_major=10):
        metadata = {"demo": {"version": version, "dependencies": [], "external_dependencies": [], "repo": "https://example.org/demo"}}
        compiled = {f"adafruit-circuitpython-bundle-{firmware_major}.x-mpy-{release}/lib/demo.mpy": version.encode()}
        source = {f"adafruit-circuitpython-bundle-py-{release}/lib/demo.py": "# SPDX-License-Identifier: GPL-3.0-only\nprint('demo')\n"}
        wheel = archive({"extra.py": "# SPDX-License-Identifier: MIT\n", "data.bin": b"resource"})
        data = {"metadata.json": json.dumps(metadata).encode(), f"{firmware_major}.zip": archive(compiled), "py.zip": archive(source)}
        inputs = {key: (key, digest(value)) for key, value in data.items()}
        extras = {"extra": {"version": "1", "repo": "https://example.org/extra", "url": "https://example.org/extra.whl", "sha256": digest(wheel), "dependencies": ["demo"], "members": {"extra.py": "lib/extra.py", "data.bin": "lib/extra/data.bin"}}}
        def download(url):
            if url.endswith(".whl"):
                return wheel
            if "license-list-data" in url:
                return b"Test license\n"
            return data[url.rsplit("/", 1)[1]]
        output = self.root / release
        prepare.prepare_bundle(release, inputs, self.root / "cache" / release, output, "test", extras, download, firmware_major)
        return output

    def test_generates_hash_verified_assets_and_preserves_licenses_and_extras(self):
        output = self.generate("20260101")
        _, catalog = validate_output(output, "test")
        self.assertEqual(set(catalog["modules"]), {"demo", "extra"})
        assets = output / catalog["assetRoot"]
        self.assertTrue((assets / "sources/demo.json").exists())
        self.assertTrue((assets / "LICENSES/GPL-3.0-only.txt").exists())
        files = json.loads((assets / "extra.json").read_bytes())["files"]
        self.assertEqual(base64.b64decode(files[1]["data"]), b"resource")

    def test_switches_a_to_b_without_changing_old_version_or_other_channel(self):
        a, b = self.generate("20260101"), self.generate("20260102", "B")
        destination = self.root / "published"
        first = publish(a, destination, "test")
        original = (destination / first["catalog"]).read_bytes()
        second = publish(b, destination, "test")
        self.assertNotEqual(first["catalog"], second["catalog"])
        self.assertEqual((destination / first["catalog"]).read_bytes(), original)
        self.assertEqual(validate_output(destination, "test")[1]["release"], "20260102")
        self.assertFalse((destination / "circuitpython/current-10.json").exists())
        self.assertTrue(stat.S_IMODE((destination / "circuitpython/current-10-test.json").stat().st_mode) & stat.S_IROTH)
        publish(a, destination, "test")  # rollback uses existing immutable files
        self.assertEqual(validate_output(destination, "test")[1]["release"], "20260101")

    def test_corrupt_update_does_not_activate_and_dry_run_does_not_write(self):
        a, b = self.generate("20260101"), self.generate("20260102", "B")
        destination = self.root / "published"
        publish(a, destination, "test")
        current = (destination / "circuitpython/current-10-test.json").read_bytes()
        publish(b, destination, "test", dry_run=True)
        self.assertEqual((destination / "circuitpython/current-10-test.json").read_bytes(), current)
        _, catalog = validate_output(b, "test")
        (b / catalog["assetRoot"] / "demo.json").write_text("damaged")
        with self.assertRaisesRegex(ValueError, "Payload checksum"):
            publish(b, destination, "test")
        self.assertEqual((destination / "circuitpython/current-10-test.json").read_bytes(), current)

    def test_refuses_replacing_immutable_files(self):
        a = self.generate("20260101")
        destination = self.root / "published"
        pointer = publish(a, destination, "test")
        (destination / pointer["catalog"]).with_name("README.txt").write_text("changed")
        with self.assertRaisesRegex(ValueError, "immutable"):
            publish(a, destination, "test")

    def test_rejects_missing_and_cyclic_dependencies(self):
        output = self.generate("20260101")
        pointer, catalog = validate_output(output, "test")
        for dependencies in [["missing"], ["demo"]]:
            catalog["modules"]["demo"]["dependencies"] = dependencies
            raw = prepare.encoded(catalog)
            (output / pointer["catalog"]).write_bytes(raw)
            pointer["sha256"] = digest(raw)
            (output / "circuitpython/current-10-test.json").write_bytes(prepare.encoded(pointer))
            with self.assertRaisesRegex(ValueError, "dependency"):
                validate_output(output, "test")

    def test_release_discovery_skips_prereleases_and_incomplete_other_major_bundles(self):
        def release(tag, major="10", **extra):
            return {"tag_name": tag, "assets": [{"name": name, "digest": "sha256:" + "a" * 64} for name in [f"adafruit-circuitpython-bundle-{tag}.json", f"adafruit-circuitpython-bundle-{major}.x-mpy-{tag}.zip", f"adafruit-circuitpython-bundle-py-{tag}.zip"]], **extra}
        result = [release("20260103", prerelease=True), release("20260102", "11"), release("20260101")]
        tag, inputs = discover_inputs("latest", lambda _: result)
        self.assertEqual(tag, "20260101")
        self.assertEqual(inputs["10.zip"][1], "a" * 64)
        tag, _ = discover_inputs("20260101", lambda url: result[-1])
        self.assertEqual(tag, "20260101")
        with self.assertRaisesRegex(ValueError, "No complete"):
            discover_inputs("latest", lambda _: [])

    def test_discovers_every_published_major_without_a_supported_version_list(self):
        tag = "20260102"
        names = [f"adafruit-circuitpython-bundle-{tag}.json", f"adafruit-circuitpython-bundle-py-{tag}.zip"]
        names += [f"adafruit-circuitpython-bundle-{major}.x-mpy-{tag}.zip" for major in [9, 10, 11, 23]]
        bundles = discover_bundles("latest", lambda _: [{"tag_name": tag, "assets": [{"name": name} for name in names]}])
        self.assertEqual(set(bundles), {9, 10, 11, 23})
        self.assertIn("23.zip", bundles[23][1])
        self.assertEqual(discover_inputs("latest", lambda _: [{"tag_name": tag, "assets": [{"name": name} for name in names]}], firmware_major=23), bundles[23])

    def test_generates_and_publishes_distinct_major_channels_preserving_old_majors(self):
        output = self.generate("20260101", firmware_major=10)
        self.generate("20260101", firmware_major=11)
        self.assertEqual(artifact_majors(output, "test"), [10, 11])
        catalog10 = validate_output(output, "test", firmware_major=10)[1]
        catalog11 = validate_output(output, "test", firmware_major=11)[1]
        self.assertNotEqual(catalog10["assetRoot"], catalog11["assetRoot"])
        self.assertEqual(catalog11["firmwareMajor"], 11)
        destination = self.root / "published"
        publish(output, destination, "test", firmware_major=10)
        first10 = (destination / "circuitpython/current-10-test.json").read_bytes()
        publish(output, destination, "test", firmware_major=11)
        next11 = self.generate("20260102", firmware_major=11)
        publish(next11, destination, "test", firmware_major=11)
        self.assertEqual((destination / "circuitpython/current-10-test.json").read_bytes(), first10)
        self.assertEqual(validate_output(destination, "test", firmware_major=11)[1]["release"], "20260102")
        self.assertEqual(artifact_majors(destination, "test"), [10, 11])

    def test_rejects_a_catalog_that_does_not_match_the_major_channel(self):
        output = self.generate("20260101")
        pointer, catalog = validate_output(output, "test")
        catalog["firmwareMajor"] = 11
        raw = prepare.encoded(catalog)
        (output / pointer["catalog"]).write_bytes(raw)
        pointer["sha256"] = digest(raw)
        (output / "circuitpython/current-10-test.json").write_bytes(prepare.encoded(pointer))
        with self.assertRaisesRegex(ValueError, "identity"):
            validate_output(output, "test", firmware_major=10)


if __name__ == "__main__":
    unittest.main()
