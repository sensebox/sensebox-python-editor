/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
export class CircuitPythonLibraryError extends Error {
  constructor(readonly moduleName: string, readonly cause?: unknown) {
    super(`Could not prepare CircuitPython library: ${moduleName}`);
  }
}
