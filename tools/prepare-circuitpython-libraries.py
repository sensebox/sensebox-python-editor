#!/usr/bin/env python3
# (c) 2026, Micro:bit Educational Foundation and contributors
# SPDX-License-Identifier: MIT
"""Generate pinned same-origin library assets; never runs during a board transfer."""
import argparse
import base64
import hashlib
import json
from pathlib import Path
import re
import urllib.request
import zipfile

RELEASE = "20261016"
BASE = f"https://github.com/adafruit/Adafruit_CircuitPython_Bundle/releases/download/{RELEASE}/"
INPUTS = {
    "metadata.json": (f"adafruit-circuitpython-bundle-{RELEASE}.json", "474dc0a6f04a4ccac9277ebad64b8e9bdec2b314f1b9c86dc98f236039f00a4a"),
    "10.zip": (f"adafruit-circuitpython-bundle-10.x-mpy-{RELEASE}.zip", "7d98825b81176a13b7cef8b14a5fddf567ed9552ce81a5cde415b091a338d375"),
    "py.zip": (f"adafruit-circuitpython-bundle-py-{RELEASE}.zip", "9ce340d9d64ef05d10c7828096a883245715874ab4adb1ab3eb454e2794555b4"),
}
ROOT = Path(__file__).resolve().parents[1]
EXTRA_INPUTS = {
    "hdc1080": {
        "version": "1.0.0",
        "repo": "https://github.com/sensebox/CircuitPython_HDC1080",
        "url": "https://files.pythonhosted.org/packages/90/71/514aff96e2bb29daf4eecdb83b2ccec53b4c148b8821b9396048fc16b296/circuitpython_hdc1080-1.0.0-py3-none-any.whl",
        "sha256": "a53fe3633452a07de7945d3f4f098196557895de58ba591da99921cebf29c3b1",
        "dependencies": ["adafruit_bus_device", "adafruit_register"],
        "member": "hdc1080.py",
        "destination": "lib/hdc1080.py",
    }
}

def encoded(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode()

def digest(data):
    return hashlib.sha256(data).hexdigest()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cache-dir", type=Path, default=Path("/tmp/sensebox-library-bundle"))
    args = parser.parse_args()
    args.cache_dir.mkdir(parents=True, exist_ok=True)
    for local, (remote, expected) in INPUTS.items():
        path = args.cache_dir / local
        if not path.exists():
            path.write_bytes(urllib.request.urlopen(BASE + remote, timeout=60).read())
        if digest(path.read_bytes()) != expected:
            raise ValueError(f"Incorrect SHA-256: {path}")
    metadata = json.loads((args.cache_dir / "metadata.json").read_text())
    archive = zipfile.ZipFile(args.cache_dir / "10.zip")
    source = zipfile.ZipFile(args.cache_dir / "py.zip")
    prefix = f"adafruit-circuitpython-bundle-10.x-mpy-{RELEASE}/"
    source_prefix = f"adafruit-circuitpython-bundle-py-{RELEASE}/lib/"
    assets = ROOT / "public" / "circuitpython" / f"adafruit-10-{RELEASE}"
    assets.mkdir(parents=True, exist_ok=True)
    modules = {}
    notice = {"release": RELEASE, "sourceBundle": BASE + INPUTS["py.zip"][0], "inputSha256": {key: value[1] for key, value in INPUTS.items()}, "modules": {}}
    license_ids = set()
    for name, info in sorted(metadata.items()):
        paths = sorted(n for n in archive.namelist() if n.startswith(prefix + "lib/" + name + "/") or n == prefix + "lib/" + name + ".mpy" or n == prefix + "lib/" + name + ".py")
        if not paths:
            raise ValueError(f"No files for {name}")
        files = [{"path": path[len(prefix):], "data": base64.b64encode(archive.read(path)).decode(), "sha256": digest(archive.read(path))} for path in paths if not path.endswith("/")]
        if name == "adafruit_framebuf":
            for resource in ["font5x8.bin", "font5x8.bin.license"]:
                data = archive.read(prefix + "examples/framebuf/" + resource)
                files.append({"path": resource, "data": base64.b64encode(data).decode(), "sha256": digest(data)})
        payload = encoded({"name": name, "files": files})
        (assets / (name + ".json")).write_bytes(payload)
        dependencies = list(dict.fromkeys(info["dependencies"] + [dep for dep in info["external_dependencies"] if dep in metadata]))
        modules[name] = {"version": info["version"], "dependencies": dependencies, "sha256": digest(payload)}
        headers = {}
        sources = []
        copyleft = False
        for path in source.namelist():
            if not (path.startswith(source_prefix + name + "/") or path == source_prefix + name + ".py") or path.endswith("/"):
                continue
            data = source.read(path)
            sources.append({"path": path[len(source_prefix):], "data": base64.b64encode(data).decode()})
            if path.endswith((".py", ".license")):
                text = data.decode("utf8", errors="replace")
                ids = re.findall(r"SPDX-License-Identifier:\s*([^\n]+)", text)
                for expression in ids:
                    license_ids.update(token for token in re.findall(r"[A-Za-z0-9.+-]+", expression) if token not in {"AND", "OR", "WITH"})
                    copyleft = copyleft or any(token in expression for token in ["GPL-", "EPL-"])
                header = []
                for line in text.splitlines():
                    if line.startswith("#") or not line.strip():
                        header.append(line)
                    else:
                        break
                if ids or header:
                    headers[path[len(source_prefix):]] = text if path.endswith(".license") else "\n".join(header)
        notice["modules"][name] = {"repo": info["repo"], "version": info["version"], "headers": headers}
        if copyleft:
            source_dir = assets / "sources"
            source_dir.mkdir(exist_ok=True)
            (source_dir / (name + ".json")).write_bytes(encoded({"name": name, "files": sources}))
    for name, info in EXTRA_INPUTS.items():
        wheel_path = args.cache_dir / (name + ".whl")
        if not wheel_path.exists():
            wheel_path.write_bytes(urllib.request.urlopen(info["url"], timeout=60).read())
        if digest(wheel_path.read_bytes()) != info["sha256"]:
            raise ValueError(f"Incorrect SHA-256: {wheel_path}")
        wheel = zipfile.ZipFile(wheel_path)
        data = wheel.read(info["member"])
        files = [{"path": info["destination"], "data": base64.b64encode(data).decode(), "sha256": digest(data)}]
        header = []
        for line in data.decode("utf8").splitlines():
            if line.startswith("#") or not line.strip():
                header.append(line)
            else:
                break
        payload = encoded({"name": name, "files": files})
        (assets / (name + ".json")).write_bytes(payload)
        modules[name] = {"version": info["version"], "dependencies": info["dependencies"], "sha256": digest(payload)}
        notice["modules"][name] = {"repo": info["repo"], "version": info["version"], "headers": {info["member"]: "\n".join(header)}}
        license_ids.add("MIT")
    licenses = assets / "LICENSES"
    licenses.mkdir(exist_ok=True)
    for identifier in sorted(license_ids):
        target = licenses / (identifier + ".txt")
        if not target.exists():
            target.write_bytes(urllib.request.urlopen(f"https://raw.githubusercontent.com/spdx/license-list-data/v3.27.0/text/{identifier}.txt", timeout=30).read())
    (assets / "NOTICES.json").write_bytes(encoded(notice))
    (assets / "README.txt").write_text(f"Library files from Adafruit's CircuitPython 10.x bundle {RELEASE}, plus pinned published senseBox modules listed in NOTICES.json.\nEach module retains its own license; see NOTICES.json and LICENSES/.\nPython source files for copyleft modules are in sources/; complete Adafruit source: {notice['sourceBundle']}\nGenerated with tools/prepare-circuitpython-libraries.py; only requested modules are copied to the board.\n")
    (ROOT / "src/device/libraries/catalog.json").write_bytes(encoded({"release": RELEASE, "firmwareMajor": 10, "assetRoot": f"circuitpython/adafruit-10-{RELEASE}/", "modules": modules}))
    print(f"Prepared {len(modules)} libraries, {sum(p.stat().st_size for p in assets.rglob('*') if p.is_file())} bytes")

if __name__ == "__main__":
    main()
