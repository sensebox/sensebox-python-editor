/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createServer, Server } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  circuitPythonFlushMiddleware,
  flushMatchingCircuitPythonFiles,
} from "./circuitpython-flush";
import type { CircuitPythonFlushRequest } from "../src/device/circuitpython-flush-protocol";

let root: string;
let volume: string;
let request: CircuitPythonFlushRequest;
let server: Server | undefined;
const contents = Buffer.from([0, 128, 255, 10]);
const marker = "Adafruit CircuitPython 10.3.0; senseBox";
const mounted = (target: string, mode = "rw", fs = "vfat") =>
  `10 1 8:1 / ${target.replaceAll(
    " ",
    "\\040"
  )} ${mode},relatime - ${fs} /dev/test ${mode}`;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "sensebox flush test-"));
  volume = join(root, "CIRCUITPY");
  await mkdir(volume);
  await writeFile(join(volume, "boot_out.txt"), marker);
  await writeFile(join(volume, "code.py"), contents);
  request = {
    directoryName: "CIRCUITPY",
    bootOut: marker,
    files: [
      {
        name: "code.py",
        size: contents.length,
        sha256: createHash("sha256").update(contents).digest("hex"),
      },
    ],
  };
});
afterEach(async () => {
  const active = server;
  if (active) {
    active.closeAllConnections();
    await new Promise<void>((resolve, reject) =>
      active.close((error) => (error ? reject(error) : resolve()))
    );
    server = undefined;
  }
  await rm(root, { recursive: true, force: true });
});

it("flushes a unique matching mounted board without changing its bytes", async () => {
  expect(await flushMatchingCircuitPythonFiles(request, mounted(volume))).toBe(
    true
  );
  expect(await readFile(join(volume, "code.py"))).toEqual(contents);
  expect(await readFile(join(volume, "boot_out.txt"), "utf8")).toBe(marker);
});

it("flushes a unique matching Windows drive without Linux mount information", async () => {
  expect(
    await flushMatchingCircuitPythonFiles(request, undefined, "win32", [
      join(root, "missing"),
      volume,
    ])
  ).toBe(true);
  expect(await readFile(join(volume, "code.py"))).toEqual(contents);
});

it("refuses ambiguous matching Windows drives", async () => {
  const other = join(root, "other");
  await mkdir(other);
  await writeFile(join(other, "boot_out.txt"), marker);
  expect(
    await flushMatchingCircuitPythonFiles(request, undefined, "win32", [
      volume,
      other,
    ])
  ).toBe(false);
});

it.each(["size", "checksum", "marker", "readonly", "filesystem"])(
  "refuses a %s mismatch",
  async (mismatch) => {
    if (mismatch === "size") request.files[0].size++;
    if (mismatch === "checksum") request.files[0].sha256 = "0".repeat(64);
    if (mismatch === "marker") request.bootOut += " different";
    expect(
      await flushMatchingCircuitPythonFiles(
        request,
        mounted(
          volume,
          mismatch === "readonly" ? "ro" : "rw",
          mismatch === "filesystem" ? "ext4" : "vfat"
        )
      )
    ).toBe(false);
  }
);

it("refuses two matching mounted boards instead of choosing one", async () => {
  const other = join(root, "other", "CIRCUITPY");
  await mkdir(other, { recursive: true });
  await writeFile(join(other, "boot_out.txt"), marker);
  expect(
    await flushMatchingCircuitPythonFiles(
      request,
      mounted(volume) + "\n" + mounted(other)
    )
  ).toBe(false);
});

it.each(["../code.py", "..", ".", "lib/code.py", "lib\\code.py", "bad\0name"])(
  "rejects unsafe file paths: %s",
  async (name) => {
    request.files[0].name = name;
    expect(
      await flushMatchingCircuitPythonFiles(request, mounted(volume))
    ).toBe(false);
  }
);

it.skipIf(process.platform === "win32")("refuses symlinked files", async () => {
  request.files[0].name = "alias.py";
  await symlink(join(volume, "code.py"), join(volume, "alias.py"));
  expect(await flushMatchingCircuitPythonFiles(request, mounted(volume))).toBe(
    false
  );
});

it("refuses missing files and duplicate entries", async () => {
  request.files[0].name = "missing.py";
  expect(await flushMatchingCircuitPythonFiles(request, mounted(volume))).toBe(
    false
  );
  request.files = [request.files[0], request.files[0]];
  expect(await flushMatchingCircuitPythonFiles(request, mounted(volume))).toBe(
    false
  );
});

async function http(flush = vi.fn(async () => true)) {
  const middleware = circuitPythonFlushMiddleware(
    "/editor/__sensebox__/flush",
    flush
  );
  const active = createServer((req, res) =>
    middleware(req, res, () => {
      res.writeHead(404).end();
    })
  );
  server = active;
  await new Promise<void>((resolve) => active.listen(0, "127.0.0.1", resolve));
  const address = active.address();
  if (!address || typeof address === "string") throw new Error("No TCP port");
  const origin = `http://127.0.0.1:${address.port}`;
  return {
    flush,
    origin,
    url: origin + "/editor/__sensebox__/flush",
    headers: { Origin: origin, "Content-Type": "application/json" },
  };
}

it("acknowledges a same-origin local POST only after the flush completes", async () => {
  let done!: () => void;
  const pending = new Promise<void>((resolve) => {
    done = resolve;
  });
  const { flush, url, headers } = await http(
    vi.fn(async () => {
      await pending;
      return true;
    })
  );
  const response = fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });
  await vi.waitFor(() => expect(flush).toHaveBeenCalledWith(request));
  done();
  expect((await response).status).toBe(204);
});

it.each(["missing", "foreign", "rebound"])(
  "rejects %s origins before accessing files",
  async (kind) => {
    const { flush, url, headers } = await http();
    const actual: Record<string, string> = { ...headers };
    if (kind === "missing") delete actual.Origin;
    else actual.Origin = "http://attacker.example";
    if (kind === "rebound") actual.Host = "attacker.example";
    expect(
      (
        await fetch(url, {
          method: "POST",
          headers: actual,
          body: JSON.stringify(request),
        })
      ).status
    ).toBe(403);
    expect(flush).not.toHaveBeenCalled();
  }
);

it("rejects GET, non-JSON, oversized and malformed requests", async () => {
  const { flush, url, headers } = await http();
  expect((await fetch(url, { headers })).status).toBe(405);
  expect(
    (
      await fetch(url, {
        method: "POST",
        headers: { ...headers, "Content-Type": "text/plain" },
        body: "{}",
      })
    ).status
  ).toBe(415);
  expect(
    (
      await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ junk: "x".repeat(65536) }),
      })
    ).status
  ).toBe(413);
  expect(
    (await fetch(url, { method: "POST", headers, body: "not json" })).status
  ).toBe(400);
  expect(
    (await fetch(url, { method: "POST", headers, body: "{}" })).status
  ).toBe(400);
  expect(flush).not.toHaveBeenCalled();
});

it("reports unavailable targets and host errors without claiming success", async () => {
  const flush = vi.fn(async () => false);
  const { url, headers } = await http(flush);
  const send = () =>
    fetch(url, { method: "POST", headers, body: JSON.stringify(request) });
  expect((await send()).status).toBe(409);
  flush.mockRejectedValueOnce(new Error("Unavailable"));
  expect((await send()).status).toBe(503);
});

it("flushes nested library files and all parent directories", async () => {
  await mkdir(join(volume, "lib", "driver"), { recursive: true });
  await writeFile(join(volume, "lib", "driver", "__init__.mpy"), contents);
  request.files[0].name = "lib/driver/__init__.mpy";
  expect(await flushMatchingCircuitPythonFiles(request, mounted(volume))).toBe(
    true
  );
  expect(await readFile(join(volume, "lib", "driver", "__init__.mpy"))).toEqual(
    contents
  );
});

it("refuses symlinked library directories and nested traversal", async () => {
  await symlink(
    volume,
    join(volume, "alias"),
    process.platform === "win32" ? "junction" : undefined
  );
  request.files[0].name = "alias/code.py";
  expect(await flushMatchingCircuitPythonFiles(request, mounted(volume))).toBe(
    false
  );
  request.files[0].name = "lib/../code.py";
  expect(await flushMatchingCircuitPythonFiles(request, mounted(volume))).toBe(
    false
  );
});
