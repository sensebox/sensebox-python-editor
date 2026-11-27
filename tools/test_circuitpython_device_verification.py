# (c) 2026, Micro:bit Educational Foundation and contributors
#
# SPDX-License-Identifier: MIT

"""Execute the editor's generated verification script with simulated board I/O.

Uses CPython to check filesystem races and checksum decisions, not MCU timing or
USB writeback. Requires Node.js to evaluate the actual TypeScript string template.
"""

import contextlib
import io
from pathlib import Path
import subprocess
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import patch


DEVICE_SOURCE = Path(__file__).resolve().parents[1] / "src/device/web-file-system-device.ts"
GENERATE_SCRIPT = r"""
import { readFileSync } from 'node:fs';
const source = readFileSync(process.argv[1], 'utf8');
const method = source.indexOf('private async waitForDeviceFiles(');
const marker = 'const source = ';
const start = source.indexOf(marker, method) + marker.length;
const endMarker = '].join("\\n")';
const end = source.indexOf(endMarker, start);
if (method < 0 || start < marker.length || end < 0)
  throw new Error('Cannot find the board verification script');
const generate = new Function('expected', 'libraryPaths', 'removed', 'entries',
  'return ' + source.slice(start, end + endMarker.length));
process.stdout.write(generate(
  [['/code.py', 1, 66, 66], ['/lib/new.mpy', 1, 67, 67]],
  ['lib/', 'lib/new.mpy'], ['lib/old.mpy'],
  [['code.py', new Uint8Array([65])], ['lib/new.mpy', new Uint8Array([66])]]
));
"""


class DeviceVerificationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.script = subprocess.check_output(
            ["node", "--input-type=module", "-e", GENERATE_SCRIPT, str(DEVICE_SOURCE)],
            text=True,
        )

    def setUp(self):
        self.files = {"/code.py": b"A", "/lib/new.mpy": b"B"}
        self.names = ["new.mpy"]
        self.inventory_error = None

    def stat(self, path):
        if path == "/lib/new.mpy" and self.inventory_error:
            raise self.inventory_error
        if path in self.files:
            return (0,)
        raise OSError(2, "Not found")

    def run_check(self, listdir=None):
        def open_file(path, mode):
            if path not in self.files:
                raise OSError(2, "Not found")
            return io.BytesIO(self.files[path])

        board_os = SimpleNamespace(
            listdir=listdir or (lambda path: self.names), stat=self.stat
        )
        output = io.StringIO()
        with (
            patch.dict(sys.modules, {"os": board_os}),
            patch("builtins.open", open_file),
            contextlib.redirect_stdout(output),
        ):
            exec(self.script, {})
        return output.getvalue().strip()

    def test_matching_files_and_inventory_succeed(self):
        self.assertEqual(self.run_check(), "1")

    def test_changed_checksum_still_blocks_restart(self):
        self.files["/lib/new.mpy"] = b"C"
        self.assertEqual(self.run_check(), "0")

    def test_stale_deleted_file_still_blocks_restart(self):
        self.files["/lib/old.mpy"] = b"old"
        self.assertEqual(self.run_check(), "0")

    def test_stale_directory_inventory_still_blocks_restart(self):
        self.files["/lib/old.mpy"] = b"old"
        self.names.append("old.mpy")
        self.assertEqual(self.run_check(), "0")

    def test_missing_required_file_still_blocks_restart(self):
        del self.files["/lib/new.mpy"]
        self.assertEqual(self.run_check(), "0")

    def test_missing_inventory_path_still_blocks_restart(self):
        self.names.clear()
        self.assertEqual(self.run_check(), "0")

    def test_directory_changes_between_listing_and_stat_are_retried(self):
        self.names.append("old.mpy")
        self.assertEqual(self.run_check(), "0")
        self.names.remove("old.mpy")
        self.assertEqual(self.run_check(), "1")

    def test_transient_stat_error_is_retried(self):
        self.inventory_error = OSError(5, "I/O error")
        self.assertEqual(self.run_check(), "0")
        self.inventory_error = None
        self.assertEqual(self.run_check(), "1")

    def test_transient_listdir_error_is_retried(self):
        def unavailable(path):
            raise OSError(5, "I/O error")

        self.assertEqual(self.run_check(listdir=unavailable), "0")
        self.assertEqual(self.run_check(), "1")


if __name__ == "__main__":
    unittest.main()
