#!/usr/bin/env python3
# (c) 2026, Micro:bit Educational Foundation and contributors
# SPDX-License-Identifier: MIT
"""Discover, validate and atomically publish static CircuitPython channels."""
import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import tempfile
import urllib.request

API = "https://api.github.com/repos/adafruit/Adafruit_CircuitPython_Bundle/releases"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def safe_path(value):
    return isinstance(value, str) and bool(value) and all(
        re.fullmatch(r"[A-Za-z0-9_.-]+", part) and part not in {".", ".."}
        for part in value.split("/")
    )


def release_items(release, get_json=None):
    if release != "latest" and not re.fullmatch(r"\d{8}", release):
        raise ValueError("Release must be latest or YYYYMMDD")
    def fetch(url):
        headers = {"Accept": "application/vnd.github+json", "User-Agent": "sensebox-library-updater"}
        token = os.environ.get("GITHUB_TOKEN")
        if token:
            headers["Authorization"] = f"Bearer {token}"
        with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30) as response:
            return json.load(response)
    get_json = get_json or fetch
    pages = range(1, 11) if release == "latest" else [None]
    for page in pages:
        result = get_json(f"{API}?per_page=100&page={page}" if page else f"{API}/tags/{release}")
        releases = result if page else [result]
        for item in releases:
            tag = item.get("tag_name", "")
            if not item.get("draft") and not item.get("prerelease") and re.fullmatch(r"\d{8}", tag):
                yield item
        if not releases:
            break


def release_bundles(item):
    tag = item["tag_name"]
    assets = {asset["name"]: asset for asset in item.get("assets", [])}
    majors = sorted({int(match[1]) for name in assets
                    if (match := re.fullmatch(rf"adafruit-circuitpython-bundle-([1-9]\d*)\.x-mpy-{tag}\.zip", name))})
    bundles = {}
    for major in majors:
        names = {"metadata.json": f"adafruit-circuitpython-bundle-{tag}.json",
                 f"{major}.zip": f"adafruit-circuitpython-bundle-{major}.x-mpy-{tag}.zip",
                 "py.zip": f"adafruit-circuitpython-bundle-py-{tag}.zip"}
        if not all(name in assets for name in names.values()):
            continue
        inputs = {}
        for local, name in names.items():
            checksum = assets[name].get("digest")
            if checksum is not None and not re.fullmatch(r"sha256:[a-f0-9]{64}", checksum):
                raise ValueError(f"Invalid upstream digest: {name}")
            inputs[local] = (name, checksum.removeprefix("sha256:") if checksum else None)
        bundles[major] = (tag, inputs)
    return bundles


def discover_bundles(release, get_json=None):
    """Discover every compiled major in the newest complete stable release."""
    for item in release_items(release, get_json):
        bundles = release_bundles(item)
        if bundles:
            return bundles
    raise ValueError("No complete stable CircuitPython bundles found")


def discover_inputs(release, get_json=None, firmware_major=10):
    for item in release_items(release, get_json):
        bundles = release_bundles(item)
        if firmware_major in bundles:
            return bundles[firmware_major]
    raise ValueError(f"No complete stable CircuitPython {firmware_major}.x bundle found")


def pointer_name(channel, firmware_major=10):
    if channel not in {"stable", "test"}:
        raise ValueError("Invalid channel")
    if type(firmware_major) is not int or firmware_major < 1:
        raise ValueError("Invalid firmware major")
    return f"current-{firmware_major}.json" if channel == "stable" else f"current-{firmware_major}-test.json"


def validate_output(root, channel, pointer=None, firmware_major=10):
    root = Path(root)
    if pointer is None:
        pointer = json.loads((root / "circuitpython" / pointer_name(channel, firmware_major)).read_bytes())
    path = pointer.get("catalog")
    if pointer.get("schemaVersion") != 1 or not safe_path(path) or not path.startswith("circuitpython/versions/"):
        raise ValueError("Invalid channel pointer")
    raw = (root / path).read_bytes()
    if digest(raw) != pointer.get("sha256"):
        raise ValueError("Catalog checksum mismatch")
    catalog = json.loads(raw)
    if (type(catalog.get("firmwareMajor")) is not int or catalog.get("firmwareMajor") != firmware_major or not re.fullmatch(r"\d{8}", catalog.get("release", "")) or
            catalog.get("assetRoot") != path.removesuffix("catalog.json") or not path.endswith("/catalog.json")):
        raise ValueError("Invalid catalog identity")
    modules = catalog.get("modules")
    if not isinstance(modules, dict) or not modules:
        raise ValueError("Empty catalog")
    destinations = {}
    visited, visiting = set(), set()
    def dependency(name):
        if name in visiting:
            raise ValueError("Cyclic dependency")
        if name in visited:
            return
        if name not in modules:
            raise ValueError(f"Missing dependency: {name}")
        visiting.add(name)
        for child in modules[name]["dependencies"]:
            dependency(child)
        visiting.remove(name)
        visited.add(name)
    for name, info in modules.items():
        if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", name) or not isinstance(info.get("version"), str) or not isinstance(info.get("dependencies"), list):
            raise ValueError("Invalid module")
        payload_raw = (root / catalog["assetRoot"] / (name + ".json")).read_bytes()
        if digest(payload_raw) != info.get("sha256"):
            raise ValueError(f"Payload checksum mismatch: {name}")
        payload = json.loads(payload_raw)
        if payload.get("name") != name or not payload.get("files"):
            raise ValueError("Invalid payload")
        paths = set()
        for file in payload["files"]:
            path = file["path"]
            if not safe_path(path) or (not path.startswith("lib/") and path not in {"font5x8.bin", "font5x8.bin.license"}) or path in paths:
                raise ValueError("Invalid payload destination")
            paths.add(path)
            data = base64.b64decode(file["data"], validate=True)
            checksum = digest(data)
            if checksum != file["sha256"] or (path in destinations and destinations[path] != checksum):
                raise ValueError("File checksum mismatch or conflicting destination")
            destinations[path] = checksum
    for name in modules:
        dependency(name)
    assets = root / catalog["assetRoot"]
    if not (assets / "NOTICES.json").is_file() or not (assets / "README.txt").is_file() or not (assets / "LICENSES").is_dir():
        raise ValueError("Missing license/provenance information")
    return pointer, catalog


def publish(source, destination, channel, dry_run=False, firmware_major=10):
    """Copy immutable assets first, then atomically replace the channel pointer."""
    source, destination = Path(source), Path(destination)
    pointer, catalog = validate_output(source, channel, firmware_major=firmware_major)
    source_assets = source / catalog["assetRoot"]
    target_assets = destination / catalog["assetRoot"]
    if source_assets.is_symlink() or any(path.is_symlink() for path in source_assets.rglob("*")):
        raise ValueError("Symlink in publication")
    if target_assets.exists():
        existing = {str(p.relative_to(target_assets)): digest(p.read_bytes()) for p in target_assets.rglob("*") if p.is_file()}
        incoming = {str(p.relative_to(source_assets)): digest(p.read_bytes()) for p in source_assets.rglob("*") if p.is_file()}
        if existing != incoming:
            raise ValueError("Refusing to replace immutable bundle files")
    if dry_run:
        return pointer
    target_assets.parent.mkdir(parents=True, exist_ok=True)
    if not target_assets.exists():
        staging = Path(tempfile.mkdtemp(prefix=".bundle-", dir=target_assets.parent))
        try:
            shutil.copytree(source_assets, staging, dirs_exist_ok=True)
            staging.rename(target_assets)
        finally:
            if staging.exists():
                shutil.rmtree(staging)
    channel_path = destination / "circuitpython" / pointer_name(channel, firmware_major)
    if channel_path.exists() and channel_path.read_bytes() == (source / "circuitpython" / pointer_name(channel, firmware_major)).read_bytes():
        return pointer
    fd, temporary = tempfile.mkstemp(prefix=".channel-", dir=channel_path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write((source / "circuitpython" / pointer_name(channel, firmware_major)).read_bytes())
            stream.flush()
            os.fsync(stream.fileno())
        os.chmod(temporary, 0o644)
        os.replace(temporary, channel_path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    return pointer


def artifact_majors(root, channel):
    suffix = "" if channel == "stable" else "-test"
    majors = sorted({int(match[1]) for path in (Path(root) / "circuitpython").glob("current-*.json")
                     if (match := re.fullmatch(rf"current-([1-9]\d*){suffix}\.json", path.name))})
    if not majors:
        raise ValueError("No channel pointers found")
    return majors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["verify", "publish"])
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--destination", type=Path)
    parser.add_argument("--channel", choices=["stable", "test"], default="test")
    parser.add_argument("--firmware-major", default="all", help="all or a firmware major number")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    if args.command == "publish" and not args.destination:
        parser.error("publish requires --destination")
    majors = artifact_majors(args.source, args.channel) if args.firmware_major == "all" else [int(args.firmware_major)]
    # Validate every selected major before activating any of its pointers.
    for major in majors:
        validate_output(args.source, args.channel, firmware_major=major)
    if args.command == "publish":
        for major in majors:
            publish(args.source, args.destination, args.channel, args.dry_run, major)
    print(f"{args.command}: {args.channel}, CircuitPython majors {majors}" + (" (dry run)" if args.dry_run else ""))


if __name__ == "__main__":
    main()
