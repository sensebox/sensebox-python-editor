/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { afterEach, expect, it, vi } from "vitest";
import { createHash, webcrypto } from "node:crypto";
import { flushCircuitPythonHostFiles } from "./circuitpython-host-flush";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
function setup(hostname = "localhost", directoryName = "CIRCUITPY") {
  vi.stubGlobal("location", new URL(`http://${hostname}:3000/`));
  vi.stubGlobal("crypto", webcrypto);
  vi.stubEnv("BASE_URL", "/editor/");
  const fetch = vi.fn().mockResolvedValue({ status: 204 });
  vi.stubGlobal("fetch", fetch);
  const getFileHandle = vi.fn(async () => ({
    getFile: async () => ({ text: async () => "Adafruit CircuitPython" }),
  }));
  const directory = {
    name: directoryName,
    getFileHandle,
  } as unknown as FileSystemDirectoryHandle;
  return { fetch, directory, getFileHandle };
}

it("sends the selected directory identity and binary SHA-256 without program contents", async () => {
  const { directory, fetch } = setup();
  const data = new Uint8Array([0, 128, 255, 10]);
  await flushCircuitPythonHostFiles(directory, [["code.py", data]]);
  const [url, options] = fetch.mock.calls[0];
  expect(String(url)).toBe("http://localhost:3000/editor/__sensebox__/flush");
  expect(options.method).toBe("POST");
  expect(JSON.parse(options.body)).toEqual({
    directoryName: "CIRCUITPY",
    bootOut: "Adafruit CircuitPython",
    files: [
      {
        name: "code.py",
        size: 4,
        sha256: createHash("sha256").update(data).digest("hex"),
      },
    ],
  });
});

it("normalizes a Windows drive-root handle to the CIRCUITPY volume identity", async () => {
  const { directory, fetch } = setup("localhost", "D:");
  await flushCircuitPythonHostFiles(directory, [
    ["code.py", new Uint8Array([1])],
  ]);
  expect(JSON.parse(fetch.mock.calls[0][1].body).directoryName).toBe(
    "CIRCUITPY"
  );
});

it("does not contact a helper on a hosted editor", async () => {
  const { directory, fetch, getFileHandle } = setup("editor.example");
  await flushCircuitPythonHostFiles(directory, [
    ["code.py", new Uint8Array([1])],
  ]);
  expect(fetch).not.toHaveBeenCalled();
  expect(getFileHandle).not.toHaveBeenCalled();
});

it("allows normal board verification to continue when the helper is absent", async () => {
  const { directory, fetch } = setup();
  fetch.mockRejectedValueOnce(new Error("No local server"));
  await expect(
    flushCircuitPythonHostFiles(directory, [["code.py", new Uint8Array([1])]])
  ).resolves.toBeUndefined();
});

it("aborts an unresponsive helper after five seconds without failing the transfer", async () => {
  const { directory, fetch } = setup();
  vi.stubGlobal("crypto", {
    subtle: { digest: vi.fn(async () => new ArrayBuffer(32)) },
  });
  fetch.mockImplementation(
    (_url, { signal }) =>
      new Promise((_resolve, reject) =>
        signal.addEventListener("abort", () => reject(new Error("Aborted")))
      )
  );
  vi.useFakeTimers();
  const result = flushCircuitPythonHostFiles(directory, [
    ["code.py", new Uint8Array([1])],
  ]);
  await vi.advanceTimersByTimeAsync(0);
  expect(fetch).toHaveBeenCalledOnce();
  await vi.advanceTimersByTimeAsync(5000);
  await expect(result).resolves.toBeUndefined();
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
});

it("bounds preparation time when reading the drive marker stalls", async () => {
  const { directory, getFileHandle, fetch } = setup();
  getFileHandle.mockImplementation(() => new Promise(() => {}));
  vi.useFakeTimers();
  const result = flushCircuitPythonHostFiles(directory, [
    ["code.py", new Uint8Array([1])],
  ]);
  await vi.advanceTimersByTimeAsync(5000);
  await expect(result).resolves.toBeUndefined();
  expect(fetch).not.toHaveBeenCalled();
});
