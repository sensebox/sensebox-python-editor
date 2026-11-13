/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { createHash } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { constants } from "node:fs";
import { lstat, open, readFile } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { basename, join, relative } from "node:path";
import { promisify } from "node:util";
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
    request.directoryName.toUpperCase() === "CIRCUITPY" &&
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

const execFile = promisify(execFileCallback);

async function windowsCircuitPythonRoots(): Promise<string[]> {
  // Avoid probing A: through Z: with Node. An empty removable-media drive can
  // block an fs call for minutes. PowerShell's provider skips those promptly.
  const { stdout } = await execFile(
    "powershell.exe",
    [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      "Get-PSDrive -PSProvider FileSystem | Where-Object { Test-Path -LiteralPath (Join-Path $_.Root 'boot_out.txt') -PathType Leaf } | ForEach-Object { $_.Root }",
    ],
    { timeout: 5000, windowsHide: true }
  );
  return stdout
    .split(/\r?\n/)
    .map((root) => root.trim())
    .filter((root) => /^[A-Za-z]:\\$/.test(root));
}

async function matchingMarker(
  target: string,
  request: CircuitPythonFlushRequest
): Promise<boolean> {
  try {
    const markerPath = join(target, "boot_out.txt");
    if ((await lstat(markerPath)).isSymbolicLink()) return false;
    const marker = await open(
      markerPath,
      constants.O_RDONLY | constants.O_NOFOLLOW
    );
    try {
      const stat = await marker.stat();
      return (
        stat.isFile() &&
        stat.size <= 8192 &&
        (await marker.readFile("utf8")) === request.bootOut
      );
    } finally {
      await marker.close();
    }
  } catch {
    return false;
  }
}

/** Discover actual mounted volumes; never accept a host path from the browser. */
export async function flushMatchingCircuitPythonFiles(
  request: CircuitPythonFlushRequest,
  mountInfo?: string,
  platform?: NodeJS.Platform,
  driveRoots?: string[]
): Promise<boolean> {
  if (!validRequest(request)) return false;
  const hostPlatform =
    platform ?? (mountInfo === undefined ? process.platform : "linux");
  const canSyncDirectories = process.platform !== "win32";
  const candidates = new Set<string>();
  if (hostPlatform === "win32") {
    // Windows does not expose /proc/mountinfo. Probe only drive roots and bind
    // the browser request to the physical volume by its complete boot marker.
    const roots = driveRoots ?? (await windowsCircuitPythonRoots());
    const matches = await Promise.all(
      roots.map(async (target) => ({
        target,
        matches: await matchingMarker(target, request),
      }))
    );
    for (const match of matches) {
      if (match.matches) candidates.add(match.target);
    }
  } else {
    mountInfo ??= await readFile("/proc/self/mountinfo", "utf8");
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
      if (await matchingMarker(target, request)) candidates.add(target);
    }
  }
  if (candidates.size !== 1) return false;
  const target = Array.from(candidates)[0];
  const handles: FileHandle[] = [];
  const directories = new Map<string, FileHandle>();
  try {
    // Windows cannot open directories for fsync. FileHandle.sync() maps to
    // FlushFileBuffers there and is the important cache barrier for CIRCUITPY.
    if (canSyncDirectories) {
      handles.push(
        await open(
          target,
          constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW
        )
      );
      directories.set(target, handles[0]);
    }
    const files: FileHandle[] = [];
    for (const file of request.files) {
      const parts = file.name.split("/");
      let parent = target;
      for (const part of parts.slice(0, -1)) {
        parent = join(parent, part);
        if (!directories.has(parent)) {
          if ((await lstat(parent)).isSymbolicLink()) return false;
          if (!canSyncDirectories) {
            continue;
          }
          const directory = await open(
            parent,
            constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW
          );
          directories.set(parent, directory);
          handles.push(directory);
        }
      }
      const filePath = join(target, file.name);
      if (relative(target, filePath).startsWith("..")) return false;
      if ((await lstat(filePath)).isSymbolicLink()) return false;
      const handle = await open(
        filePath,
        (process.platform === "win32" ? constants.O_RDWR : constants.O_RDONLY) |
          constants.O_NOFOLLOW
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
    if (canSyncDirectories) {
      for (const [, directory] of Array.from(directories).sort(
        ([a], [b]) => b.split("/").length - a.split("/").length
      ))
        await directory.sync();
    }
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
      if (!["linux", "win32"].includes(process.platform)) return;
      server.middlewares.use(
        circuitPythonFlushMiddleware(`${server.config.base}__sensebox__/flush`)
      );
    },
  };
}
