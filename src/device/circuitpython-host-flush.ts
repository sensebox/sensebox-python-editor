/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import type { CircuitPythonFlushRequest } from "./circuitpython-flush-protocol";

/** Optional local-editor acceleration. MCU verification remains authoritative. */
export async function flushCircuitPythonHostFiles(
  directory: FileSystemDirectoryHandle,
  entries: [string, Uint8Array][]
): Promise<void> {
  if (!["localhost", "127.0.0.1", "[::1]"].includes(location.hostname)) return;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout>;
  const expired = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve();
    }, 5000);
  });
  const prepareAndFlush = async () => {
    const bootOut = await (
      await (await directory.getFileHandle("boot_out.txt")).getFile()
    ).text();
    const files = await Promise.all(
      entries.map(async ([name, data]) => ({
        name,
        size: data.length,
        sha256: Array.from(
          new Uint8Array(
            await crypto.subtle.digest("SHA-256", data.slice().buffer)
          ),
          (byte) => byte.toString(16).padStart(2, "0")
        ).join(""),
      }))
    );
    const body: CircuitPythonFlushRequest = {
      directoryName: directory.name,
      bootOut,
      files,
    };
    if (controller.signal.aborted) return;
    await fetch(
      new URL(
        "__sensebox__/flush",
        new URL(import.meta.env.BASE_URL, location.origin)
      ),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    );
  };
  try {
    await Promise.race([prepareAndFlush(), expired]);
  } catch {
    // No local helper, revoked permissions or a timeout: use the existing
    // board-side visibility gate without changing the filesystem or rebooting early.
  } finally {
    clearTimeout(timer!);
  }
}
