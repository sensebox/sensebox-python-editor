# Automatic CircuitPython library updates

The editor can load newer CircuitPython catalogs for **all published firmware
major versions** without an editor
release or container rebuild. A daily GitHub Actions job generates and validates
static assets; nginx serves them from the separate `library-data` directory.
The board firmware selects the matching major automatically; a new upstream
major does not need a code change. The checked-in 20261016 bundle remains the
built-in fallback for 10.x boards only. Firmware is never upgraded automatically.

## Data flow

1. `tools/prepare-circuitpython-libraries.py --release latest` finds the newest
   complete stable Adafruit release and detects every offered `N.x-mpy` archive,
   alongside the metadata and Python source archive. For example, 9.x, 10.x and
   11.x become separate catalogs automatically. If upstream stops publishing a
   major, its existing channel is retained at its last published version.
   `--firmware-major N` can instead find the newest complete release for one major.
   GitHub-provided SHA-256 digests are checked when available;
   downloaded hashes are recorded in `NOTICES.json` in all cases. The existing
   pinned fallback inputs and senseBox wheels retain their pinned digest checks.
2. The generator produces a content-versioned directory under
   `circuitpython/versions/`. Its identity includes the input digests, senseBox
   extras and generator fingerprint. Licenses and copyleft sources stay with
   the assets. Catalog and payload checksums, destinations and dependency graphs
   are validated before an artifact is eligible for publication.
3. The publisher copies the complete immutable directory, then replaces the
   channel pointer for each firmware major with an atomic rename. It refuses to
   overwrite a version directory with different content. Old versions remain available for active
   transfers and rollback. It never deletes previous versions automatically.
4. Before each transfer, the editor reads the firmware major from `boot_out.txt`
   and fetches the matching small channel pointer with
   caching disabled and verifies its catalog digest. All resolution, downloads
   and cleanup in that transfer use one snapshot. Payload caches include the
   asset path and hash, so a new release cannot reuse old library bytes.
5. Invalid/unavailable channel metadata falls back to the last completely
   prepared catalog for that same firmware major in the current editor session.
   Only 10.x has a built-in catalog on a fresh page; another major never borrows
   that fallback. Missing compatible libraries abort before board mutation.
   Firmware-only projects can still transfer without a compatible catalog, with
   catalog-based library cleanup disabled for that transfer. A required payload error aborts preparation before any board
   mutation; it does not partially activate a new catalog. Existing checksum,
   flush and restart gates still apply.

The runtime does not download ZIPs or call GitHub. Files come from the editor's
own origin. Libraries absent from both the built-in and accepted runtime catalogs
remain unknown and are preserved during cleanup. Previously accepted module names
are remembered for cleanup per firmware major for the lifetime of the editor session. Dynamic imports
retain their existing limitations.

## Deployment and channels

Deploy the updated editor/container and Compose configuration once to enable the
runtime loader and read-only `./library-data` mount. `deploy-service.sh` creates
that directory; subsequent bundle updates do not rebuild or restart the editor.
The Docker workflow copies the Compose/deploy files before running deployment.
The host must have Python 3.9+ available for the publication script.

The `CircuitPython libraries` workflow uses the existing `SSH_HOST`, `SSH_USER`,
`SSH_PRIVATE_KEY` and `SSH_KNOWN_HOSTS` secrets and the existing deployment path
`/home/ubuntu/sensebox-python-editor`. It runs daily at 05:23 UTC and publishes the
stable channel only from the default branch. No GitHub release is created.
A workflow file must reach the default branch before GitHub can schedule or
manually dispatch it; see [GitHub's manual workflow documentation](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow).

Manual inputs:

| Input            | Default  | Meaning                                                   |
| ---------------- | -------- | --------------------------------------------------------- |
| `release`        | `latest` | Automatic discovery or an existing `YYYYMMDD` release     |
| `firmware_major` | `all`    | Automatically detect offered majors, or select one number |
| `channel`        | `test`   | Separate test or stable channel                           |
| `dry_run`        | `true`   | Upload a validated Actions artifact without publishing    |

Stable uses `circuitpython/current-N.json`; test uses
`circuitpython/current-N-test.json`, where N is the board firmware major.
For example, a board with 11.x uses `current-11.json`. Each pointer references
an immutable catalog for that same major.
The normal editor uses stable. For local testing, launch with
`VITE_CIRCUITPYTHON_LIBRARY_CHANNEL=test npm run dev`. This build-time selection
prevents a public URL parameter from changing a user's production channel.

To generate, inspect and locally activate a real bundle without a new release:

```sh
python3 tools/prepare-circuitpython-libraries.py --release 20261016 --firmware-major 10 --channel test --output-dir /tmp/bundle-test
python3 tools/circuitpython_bundle.py verify --source /tmp/bundle-test --channel test
python3 tools/circuitpython_bundle.py publish --source /tmp/bundle-test --destination public --channel test --dry-run
python3 tools/circuitpython_bundle.py publish --source /tmp/bundle-test --destination public --channel test
VITE_CIRCUITPYTHON_LIBRARY_CHANNEL=test npm run dev
```

Generated local channel files are ignored by Git. To stop using them, remove the
local test pointer `public/circuitpython/current-10-test.json` or restart the dev
server without the test-channel variable. The bundled fallback is not rewritten
when `--output-dir` is used. Regenerating the built-in fallback with no arguments
retains the existing pinned workflow.

For rollback, manually generate/publish an older release to the same channel,
turning `dry_run` off only for activation. Alternatively publish an older saved
artifact with the publisher. Verify the desired release and its catalog before
activating it. Do not edit or overwrite an existing version directory.

## Tests without new upstream or editor releases

```sh
python3 -m unittest discover -s tools -p 'test_circuitpython*.py' -v
npm test -- --run src/device/circuitpython-libraries.test.ts src/device/web-file-system-device.test.ts
npm run test:e2e:headless -- src/e2e/sensebox-device.test.ts --grep 'runtime bundles'
```

The Python tests create tiny local bundles A/B, including ZIP metadata, licenses,
source and an extra wheel. They test discovery, SHA checks, dependency validation,
publication, dry runs, rollback and immutable-version protection without network
access. Runtime tests switch mocked channel pointers and check that catalogs and
payload caches cannot mix versions. The browser test transfers A, switches to B,
removes an unused dependency and its directory, then breaks the channel metadata
and confirms B remains usable without replacement writes. It then simulates an
11.x board and verifies that the 11.x channel supplies its libraries instead.
Offline discovery tests include a future major 23 to guard against hard-coded
version lists. It uses simulated
browser USB/filesystem APIs, not physical hardware.

For Node versions whose experimental webstorage conflicts with jsdom, use
`NODE_OPTIONS=--no-experimental-webstorage npm test -- --run ...`.
