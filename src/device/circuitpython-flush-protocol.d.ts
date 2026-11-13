/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

export interface CircuitPythonFlushRequest {
  directoryName: string;
  bootOut: string;
  files: { name: string; size: number; sha256: string }[];
}
