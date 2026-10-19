/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { open, readFile } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { basename, join } from "node:path";
import type { Plugin } from "vite";
import type { CircuitPythonFlushRequest } from "../src/device/circuitpython-flush-protocol";

const MAX_BODY = 65536;
const MAX_BYTES = 64 * 1024 * 1024;
const loopback = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

function validRequest(value: unknown): value is CircuitPythonFlushRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as CircuitPythonFlushRequest;
  return (
    typeof request.directoryName === "string" &&
    request.directoryName.length > 0 &&
    request.directoryName.length <= 255 &&
    typeof request.bootOut === "string" &&
    request.bootOut.length <= 8192 &&
    request.bootOut.includes("CircuitPython") &&
    Array.isArray(request.files) &&
    request.files.length > 0 &&
    request.files.length <= 128 &&
    new Set(request.files.map((file) => file?.name)).size ===
      request.files.length &&
    request.files.every(
      (file) =>
        file &&
        typeof file.name === "string" &&
        file.name.length > 0 &&
        file.name.length <= 512 &&
        file.name
          .split("/")
          .every(
            (part) =>
              part.length > 0 &&
              part.length <= 255 &&
              part !== "." &&
              part !== ".."
          ) &&
        !file.name.includes("\\") &&
        !file.name.includes("\0") &&
        file.name !== "." &&
        file.name !== ".." &&
        Number.isSafeInteger(file.size) &&
        file.size >= 0 &&
        file.size <= MAX_BYTES &&
        typeof file.sha256 === "string" &&
        /^[a-f0-9]{64}$/.test(file.sha256)
    ) &&
    request.files.reduce((total, file) => total + file.size, 0) <= MAX_BYTES
  );
}

/** Discover actual mounted FAT volumes; never accept a host path from the browser. */
export async function flushMatchingCircuitPythonFiles(
  request: CircuitPythonFlushRequest,
  mountInfo?: string
): Promise<boolean> {
  if (!validRequest(request)) return false;
  mountInfo ??= await readFile("/proc/self/mountinfo", "utf8");
  const candidates = new Set<string>();
  for (const line of mountInfo.split("\n")) {
    const fields = line.split(" ");
    const separator = fields.indexOf("-");
    if (separator < 6 || fields[separator + 1] !== "vfat") continue;
    const target = fields[4].replace(/\\([0-7]{3})/g, (_, octal: string) =>
      String.fromCharCode(parseInt(octal, 8))
    );
    if (
      target === "/" ||
      basename(target) !== request.directoryName ||
      !fields[5].split(",").includes("rw")
    )
      continue;
    try {
      const marker = await open(
        join(target, "boot_out.txt"),
        constants.O_RDONLY | constants.O_NOFOLLOW
      );
      try {
        const stat = await marker.stat();
        if (
          stat.isFile() &&
          stat.size <= 8192 &&
          (await marker.readFile("utf8")) === request.bootOut
        )
          candidates.add(target);
      } finally {
        await marker.close();
      }
    } catch {
      /* A missing/unreadable/non-CircuitPython volume is not a match. */
    }
  }
  if (candidates.size !== 1) return false;
  const target = Array.from(candidates)[0];
  const handles: FileHandle[] = [];
  const directories = new Map<string, FileHandle>();
  try {
    handles.push(
      await open(
        target,
        constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW
      )
    );
    directories.set(target, handles[0]);
    const files: FileHandle[] = [];
    for (const file of request.files) {
      const parts = file.name.split("/");
      let parent = target;
      for (const part of parts.slice(0, -1)) {
        parent = join(parent, part);
        if (!directories.has(parent)) {
          const directory = await open(
            parent,
            constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW
          );
          directories.set(parent, directory);
          handles.push(directory);
        }
      }
      const handle = await open(
        join(target, file.name),
        constants.O_RDONLY | constants.O_NOFOLLOW
      );
      handles.push(handle);
      files.push(handle);
      const stat = await handle.stat();
      if (!stat.isFile() || stat.size !== file.size) return false;
      const bytes = await handle.readFile();
      if (
        bytes.length !== file.size ||
        createHash("sha256").update(bytes).digest("hex") !== file.sha256
      )
        return false;
    }
    // Flush file data first, then the directory entry changed by Chrome's rename.
    for (const handle of files) await handle.sync();
    for (const [, directory] of Array.from(directories).sort(
      ([a], [b]) => b.split("/").length - a.split("/").length
    ))
      await directory.sync();
    return true;
  } catch {
    return false;
  } finally {
    await Promise.allSettled(handles.map((handle) => handle.close()));
  }
}

export function circuitPythonFlushMiddleware(
  endpoint: string,
  flush: (
    request: CircuitPythonFlushRequest
  ) => Promise<boolean> = flushMatchingCircuitPythonFiles
) {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (req.url?.split("?")[0] !== endpoint) {
      next();
      return;
    }
    res.setHeader("Cache-Control", "no-store");
    let trusted = false;
    try {
      const origin = new URL(req.headers.origin ?? "");
      trusted =
        loopback.has(req.socket.remoteAddress ?? "") &&
        ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname) &&
        ["http:", "https:"].includes(origin.protocol) &&
        origin.host === req.headers.host;
    } catch {
      /* Missing or malformed origins are rejected. */
    }
    if (!trusted) {
      res.writeHead(403).end();
      return;
    }
    if (req.method !== "POST") {
      res.writeHead(405).end();
      return;
    }
    if (
      req.headers["content-type"]?.split(";")[0].trim() !== "application/json"
    ) {
      res.writeHead(415).end();
      return;
    }
    let length = 0;
    let tooLarge = false;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      if (tooLarge) return;
      length += chunk.length;
      if (length > MAX_BODY) {
        tooLarge = true;
        chunks.length = 0;
        res.writeHead(413).end();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) return;
      void (async () => {
        let body: unknown;
        try {
          body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        } catch {
          res.writeHead(400).end();
          return;
        }
        if (!validRequest(body)) {
          res.writeHead(400).end();
          return;
        }
        try {
          res.writeHead((await flush(body)) ? 204 : 409).end();
        } catch {
          res.writeHead(503).end();
        }
      })();
    });
    req.on("error", () => {
      if (!res.headersSent) res.writeHead(400).end();
    });
  };
}

export function circuitPythonHostFlushPlugin(): Plugin {
  return {
    name: "circuitpython-local-host-flush",
    apply: "serve",
    configureServer(server) {
      if (process.platform !== "linux") return;
      server.middlewares.use(
        circuitPythonFlushMiddleware(`${server.config.base}__sensebox__/flush`)
      );
    },
  };
}
