/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@codemirror/state";
import * as LSP from "vscode-languageserver-protocol";
import { Action, Diagnostic } from "../lint/lint";
import { positionToOffset } from "./positions";
import { MicrobitUSBConnection } from "@microbit/microbit-connection/usb";
import { ConnectionStatus } from "@microbit/microbit-connection";
import circuitPythonLibraryCatalog from "../../../device/libraries/catalog.json";

const reportMicrobitVersionApiUnsupported =
  "reportMicrobitVersionApiUnsupported";

const circuitPythonBuiltinModules = new Set([
  "analogbufio",
  "analogio",
  "array",
  "audiobusio",
  "audiocore",
  "audiomixer",
  "audiomp3",
  "audiopwmio",
  "board",
  "busio",
  "countio",
  "digitalio",
  "displayio",
  "esp32",
  "keypad",
  "microcontroller",
  "pwmio",
  "rainbowio",
  "rtc",
  "socketpool",
  "storage",
  "supervisor",
  "time",
  "touchio",
  "usb_cdc",
  "usb_hid",
  "wifi",
]);

const circuitPythonLibraryModules = new Set(
  Object.keys(circuitPythonLibraryCatalog.modules)
);

const isCircuitPythonImport = (line: string) => {
  const match = /^\s*(?:from|import)\s+([\w.]+)/.exec(line);
  if (!match) return false;
  const module = match[1].split(".")[0];
  return (
    circuitPythonBuiltinModules.has(module) ||
    circuitPythonLibraryModules.has(module)
  );
};

const isCircuitPythonDiagnostic = (
  document: Text,
  from: number,
  to: number,
  code: LSP.Diagnostic["code"]
) => {
  const line = document.lineAt(from).text;
  const highlighted = document.sliceString(from, to);
  const timeFunction = /\btime\.(?:monotonic|struct_time|mktime)\b/;
  const neoPixelOption = /^(?:brightness|pixel_order|auto_write|GRB)$/.test(
    highlighted
  );
  const precedingSource = document.sliceString(Math.max(0, from - 1_000), from);
  return (
    (code === "reportMissingImports" && isCircuitPythonImport(line)) ||
    ((code === "reportAttributeAccessIssue" ||
      code === "reportGeneralTypeIssues" ||
      code === "reportCallIssue" ||
      code === "reportArgumentType") &&
      (timeFunction.test(line) ||
        (neoPixelOption &&
          precedingSource.lastIndexOf("neopixel.NeoPixel(") >
            precedingSource.lastIndexOf(")"))))
  );
};

const severityMapping = {
  [LSP.DiagnosticSeverity.Error]: "error",
  [LSP.DiagnosticSeverity.Warning]: "warning",
  [LSP.DiagnosticSeverity.Information]: "info",
  [LSP.DiagnosticSeverity.Hint]: "hint",
} as const;

export const diagnosticsMapping = (
  document: Text,
  lspDiagnostics: LSP.Diagnostic[],
  device: MicrobitUSBConnection,
  warnOnV2OnlyFeatures: boolean,
  warnOnV2OnlyFeaturesAction: () => Action
): Diagnostic[] =>
  lspDiagnostics
    .map(({ range, message, severity, tags, code }): Diagnostic | undefined => {
      // Only show warnings for using V2 API features if a V1 board is connected
      // and warnOnV2OnlyFeatures setting is on.
      if (
        code === reportMicrobitVersionApiUnsupported &&
        (!warnOnV2OnlyFeatures ||
          device.status !== ConnectionStatus.Connected ||
          device.getBoardVersion() !== "V1")
      ) {
        return undefined;
      }

      const from = positionToOffset(document, range.start);
      const to = positionToOffset(document, range.end);
      // Skip if we can't map to the current document.
      if (from !== undefined && to !== undefined && to >= from) {
        if (isCircuitPythonDiagnostic(document, from, to, code)) {
          return undefined;
        }
        return {
          from,
          to,
          // Missing severity is client defined. Warn for now.
          severity: severityMapping[severity ?? LSP.DiagnosticSeverity.Warning],
          message: typeof message === "string" ? message : message.value,
          tags: tags ? tags.map(convertTag) : undefined,
          actions:
            code === reportMicrobitVersionApiUnsupported
              ? [warnOnV2OnlyFeaturesAction()]
              : [],
        };
      }
      return undefined;
    })
    .filter((x): x is Diagnostic => Boolean(x));

const convertTag = (tag: LSP.DiagnosticTag): string => {
  switch (tag) {
    case LSP.DiagnosticTag.Deprecated:
      return "deprecated";
    case LSP.DiagnosticTag.Unnecessary:
      return "unnecessary";
    default:
      throw new Error("Unsupported tag.");
  }
};
