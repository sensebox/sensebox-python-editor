/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  BoardVersion,
  ConnectionStatus,
  ConnectionStatusChange,
  FlashDataSource,
  FlashOptions,
  ProgressStage,
} from "@microbit/microbit-connection";
import { MicrobitUSBConnection } from "@microbit/microbit-connection/usb";
import { CircuitPythonLibraryError } from "./circuitpython-library-error";
import { Logging } from "../logging/logging";
import { SimpleEventTarget } from "./simple-event-target";

export type CircuitPythonErrorCode =
  | "unsupported"
  | "connect"
  | "not-connected"
  | "directory"
  | "wrong-directory"
  | "write"
  | "filesystem-state"
  | "permission"
  | "storage-full"
  | "library"
  | "sync"
  | "start"
  | "repl";

type FileWriteOperation =
  | "open-file"
  | "read-file"
  | "create-writer"
  | "write-file"
  | "close-file";

interface FileWriteDetails {
  fileName: string;
  operation: FileWriteOperation;
}

export class CircuitPythonError extends Error {
  constructor(
    readonly code: CircuitPythonErrorCode,
    readonly cause?: unknown,
    readonly file?: FileWriteDetails,
    readonly moduleName?: string
  ) {
    super(code);
  }
}

interface WebFileSystemEventMap {
  status: ConnectionStatusChange;
  flash: void;
  serialdata: { data: string };
  serialreset: void;
}

/** One serial connection for the console and a remembered CIRCUITPY directory. */
export class WebFileSystemConnection
  extends SimpleEventTarget<WebFileSystemEventMap>
  implements MicrobitUSBConnection
{
  readonly type = "usb" as const;
  status: ConnectionStatus = ConnectionStatus.NoAuthorizedDevice;
  private directoryHandle: FileSystemDirectoryHandle | undefined;
  private port: SerialPort | undefined;
  private reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  private reading: Promise<void> | undefined;
  private connecting = false;
  private flashing = false;
  private checkingFiles = false;
  private serialResponses = new Set<(event: { data: string }) => void>();
  private writes: Promise<void> = Promise.resolve();

  constructor(
    private options: {
      logging: Logging;
      files: () => Promise<Record<string, Uint8Array>>;
      libraryFiles?: (
        project: Record<string, Uint8Array>,
        directory: FileSystemDirectoryHandle
      ) => Promise<Record<string, Uint8Array>>;
      flushHostFiles?: (
        directory: FileSystemDirectoryHandle,
        entries: [string, Uint8Array][]
      ) => Promise<void>;
    }
  ) {
    super();
  }

  async initialize(): Promise<void> {}

  async checkAvailability() {
    return "serial" in navigator && "showDirectoryPicker" in window
      ? ("available" as const)
      : ("unsupported" as const);
  }

  dispose(): void {
    void this.disconnect().catch((e) =>
      this.options.logging.error("Disconnect failed", e)
    );
  }

  /** Connecting never reads or writes project files. Call from a user gesture. */
  async connect(): Promise<void> {
    if (this.port || this.connecting) return;
    if (!("serial" in navigator)) throw new CircuitPythonError("unsupported");
    this.connecting = true;
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      this.port = port;
      this.dispatchEvent("serialreset");
      this.setStatus(ConnectionStatus.Connected);
      this.reading = this.readSerial(port);
    } catch (e) {
      if (e instanceof DOMException && e.name === "NotFoundError") return;
      throw new CircuitPythonError("connect", e);
    } finally {
      this.connecting = false;
    }
  }

  private async readSerial(port: SerialPort): Promise<void> {
    try {
      while (port.readable) {
        const reader = port.readable.getReader();
        this.reader = reader;
        const decoder = new TextDecoder();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) return;
            const event = { data: decoder.decode(value, { stream: true }) };
            for (const listener of this.serialResponses) listener(event);
            if (!this.checkingFiles) this.dispatchEvent("serialdata", event);
          }
        } finally {
          reader.releaseLock();
          this.reader = undefined;
        }
      }
    } catch (e) {
      this.options.logging.error("Serial connection lost", e);
    } finally {
      if (this.port === port) {
        this.port = undefined;
        this.directoryHandle = undefined;
        this.setStatus(ConnectionStatus.Disconnected);
        await port.close().catch(() => {});
      }
    }
  }

  get hasDirectory(): boolean {
    return !!this.directoryHandle;
  }

  /** The native picker must run directly inside the dialog button's gesture. */
  async selectDirectory(): Promise<boolean> {
    try {
      const directory = await window.showDirectoryPicker({
        mode: "readwrite",
        id: "circuitpy",
      });
      if (
        directory.kind !== "directory" ||
        directory.name.toUpperCase() !== "CIRCUITPY"
      ) {
        throw new CircuitPythonError("wrong-directory");
      }
      let marker: File;
      try {
        marker = await (
          await directory.getFileHandle("boot_out.txt")
        ).getFile();
      } catch {
        throw new CircuitPythonError("wrong-directory");
      }
      if (!(await marker.text()).includes("CircuitPython")) {
        throw new CircuitPythonError("wrong-directory");
      }
      this.directoryHandle = directory;
      return true;
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return false;
      if (e instanceof CircuitPythonError) throw e;
      throw new CircuitPythonError("directory", e);
    }
  }

  getBoardVersion(): BoardVersion {
    return "V2";
  }

  /** Wait for the REPL before writing, so auto-reload cannot run half a project. */
  private async enterRepl(): Promise<void> {
    let output = "";
    let listener: (event: { data: string }) => void;
    let timer: ReturnType<typeof setTimeout>;
    const prompt = new Promise<void>((resolve, reject) => {
      listener = ({ data }) => {
        output = (output + data).slice(-256);
        if (output.includes(">>> ")) resolve();
      };
      this.addEventListener("serialdata", listener);
      timer = setTimeout(() => reject(new CircuitPythonError("repl")), 3000);
    });
    try {
      // Attach both failure handlers before writing to avoid unhandled rejections.
      await Promise.all([prompt, this.writeSerial("\x03\x03\x02")]);
    } finally {
      clearTimeout(timer!);
      this.removeEventListener("serialdata", listener!);
    }
  }

  async flash(
    _dataSource: FlashDataSource,
    options: FlashOptions
  ): Promise<void> {
    if (this.flashing) return;
    if (!this.port) throw new CircuitPythonError("not-connected");
    if (!this.directoryHandle) throw new CircuitPythonError("directory");
    this.flashing = true;
    this.options.logging.event({ type: "webfilesystem-flash" });
    try {
      const project = await this.options.files();
      let libraries: Record<string, Uint8Array> = {};
      try {
        libraries =
          (await this.options.libraryFiles?.(project, this.directoryHandle)) ??
          {};
      } catch (cause) {
        throw new CircuitPythonError(
          "library",
          cause,
          undefined,
          cause instanceof CircuitPythonLibraryError ? cause.moduleName : ""
        );
      }
      // User-owned project files take precedence over automatic dependencies.
      const entries = Object.entries({ ...libraries, ...project });
      // Write the entry point after its dependencies.
      entries.sort(
        ([a], [b]) => Number(a === "code.py") - Number(b === "code.py")
      );
      await this.enterRepl();
      let completed = 0;
      const changed: [string, Uint8Array][] = [];
      for (const [name, content] of entries) {
        if (await this.writeProjectFile(this.directoryHandle, name, content))
          changed.push([name, content]);
        options.progress?.(
          ProgressStage.PartialFlashing,
          ++completed / entries.length
        );
      }
      if (changed.length && this.options.flushHostFiles) {
        try {
          await this.options.flushHostFiles(this.directoryHandle, changed);
        } catch (cause) {
          this.options.logging.error(
            "Local CircuitPython host flush unavailable",
            cause
          );
        }
      }
      // Keep internal read/checksum commands out of the user's terminal.
      this.checkingFiles = true;
      try {
        await this.waitForDeviceFiles(entries);
      } finally {
        this.checkingFiles = false;
      }
      await this.restartAfterTransfer();
      options.progress?.(ProgressStage.PartialFlashing, undefined);
      this.options.logging.event({ type: "webfilesystem-flash-complete" });
      this.dispatchEvent("flash");
    } catch (e) {
      // A failed file write needs a fresh directory handle after recovery.
      // Preserve REPL/connection errors without pretending a file write failed.
      if (!(e instanceof CircuitPythonError) || e.file) {
        this.directoryHandle = undefined;
      }
      if (e instanceof CircuitPythonError) throw e;
      throw new CircuitPythonError("write", e);
    } finally {
      this.flashing = false;
    }
  }

  /** Host close() can finish before USB filesystem caches reach the board. */
  private async waitForDeviceFiles(
    entries: [string, Uint8Array][]
  ): Promise<void> {
    const expected = entries.map(([name, data]) => {
      let a = 1;
      let b = 0;
      for (const byte of data) {
        a = (a + byte) % 65521;
        b = (b + a) % 65521;
      }
      return [name.startsWith("/") ? name : `/${name}`, data.length, a, b];
    });
    // Only read files on CircuitPython. Never remount storage or disable USB
    // write protection to work around host permissions or a read-only drive.
    const source = [
      "_ok = True",
      `for _path, _size, _ea, _eb in ${JSON.stringify(expected)}:`,
      " try:",
      "  _n, _a, _b = 0, 1, 0",
      "  with open(_path, 'rb') as _f:",
      "   while True:",
      "    _chunk = _f.read(256)",
      "    if not _chunk: break",
      "    _n += len(_chunk)",
      "    for _byte in _chunk:",
      "     _a = (_a + _byte) % 65521",
      "     _b = (_b + _a) % 65521",
      "  _ok = _ok and (_n, _a, _b) == (_size, _ea, _eb)",
      " except OSError:",
      "  _ok = False",
      "print(int(_ok))",
    ].join("\n");
    let failure: Error | undefined;
    let verified = false;
    try {
      await this.serialExchange(
        () => this.writeSerial("\x01"),
        (output) =>
          /raw REPL; CTRL-B to exit\r?\n>/.test(output) ? true : undefined,
        3000
      );
      const deadline = Date.now() + 60000;
      let matchingSince: number | undefined;
      while (Date.now() < deadline) {
        const matches = await this.serialExchange(
          async () => {
            const bytes = new TextEncoder().encode(source + "\n");
            // Bound CDC bursts so the interpreter's input buffer cannot overflow.
            for (let offset = 0; offset < bytes.length; offset += 128) {
              await this.writeSerial(bytes.slice(offset, offset + 128));
              if (offset + 128 < bytes.length) {
                await new Promise((resolve) => setTimeout(resolve, 10));
              }
            }
            // In raw REPL, Ctrl-D executes this check. It is NOT a soft reboot.
            await this.writeSerial("\x04");
          },
          (output) => {
            // Consume acknowledgement, stdout, stderr and the final raw prompt.
            // Marker-looking text or a partial response is not an acknowledgement.
            // Raw REPL separates stdout and stderr with EOT (Ctrl-D) bytes.
            // eslint-disable-next-line no-control-regex
            const frame = output.match(/^OK([\s\S]*?)\x04([\s\S]*?)\x04>/);
            if (!frame) return undefined;
            if (frame[2] || !/^[01]$/.test(frame[1].trim())) {
              throw new CircuitPythonError(
                "sync",
                new Error(frame[2] || "Invalid raw REPL response")
              );
            }
            return frame[1].trim() === "1";
          },
          Math.min(5000, Math.max(1, deadline - Date.now()))
        );
        if (matches) {
          matchingSince ??= Date.now();
          // A single matching read can occur while host metadata writes are
          // still arriving. Require repeated matches over a quiet interval.
          if (Date.now() - matchingSince >= 1000) {
            verified = true;
            break;
          }
        } else {
          matchingSince = undefined;
        }
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(250, Math.max(0, deadline - Date.now())))
        );
      }
      if (!verified) throw new CircuitPythonError("sync");
    } catch (e) {
      failure = e instanceof Error ? e : new Error(String(e));
    }
    try {
      // Always restore friendly REPL and consume its prompt. Only then can the
      // transfer's final Ctrl-D reload code.py rather than execute raw input.
      await this.serialExchange(
        () => this.writeSerial("\x03\x02"),
        (output) => (output.includes(">>> ") ? true : undefined),
        3000
      );
    } catch (e) {
      // Recovery must not replace the error which prevented verification.
      failure ??= e instanceof Error ? e : new Error(String(e));
    }
    if (failure) throw failure;
  }

  private async restartAfterTransfer(): Promise<void> {
    let output = "";
    let timer: ReturnType<typeof setTimeout>;
    const listener = ({ data }: { data: string }) => {
      output = (output + data).slice(-16384);
    };
    this.serialResponses.add(listener);
    try {
      // Keep program output visible. This short observation only catches the
      // reported immediate file-load failure; it does not validate user code.
      await Promise.all([
        this.writeSerial("\x04"),
        new Promise<void>((resolve) => {
          timer = setTimeout(resolve, 1000);
        }),
      ]);
      // CircuitPython's translated header and terminal status escape sequences
      // surround file-load errors. A Python traceback instead indicates an error
      // while running the user's code, which remains a console diagnostic.
      const plain = output.replace(
        // eslint-disable-next-line no-control-regex
        /\x1b\[[0-?]*[ -/]*[@-~]|\x1b\][\s\S]*?(?:\x07|\x1b\\)/g,
        ""
      );
      const loadError = plain.match(
        /(?:^|\n)code\.py [^\r\n]*:\r?\n\s*OSError: \[Errno 5\][^\r\n]*\r?\n/
      );
      if (loadError) {
        throw new CircuitPythonError("start", new Error(loadError[0].trim()));
      }
    } finally {
      clearTimeout(timer!);
      this.serialResponses.delete(listener);
    }
  }

  private async serialExchange<T>(
    send: () => Promise<void>,
    parse: (output: string) => T | undefined,
    timeout: number
  ): Promise<T> {
    let output = "";
    let listener: (event: { data: string }) => void;
    let timer: ReturnType<typeof setTimeout>;
    const result = new Promise<T>((resolve, reject) => {
      listener = ({ data }) => {
        output = (output + data).slice(-16384);
        try {
          const parsed = parse(output);
          if (parsed !== undefined) resolve(parsed);
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      };
      this.serialResponses.add(listener);
      timer = setTimeout(() => reject(new CircuitPythonError("sync")), timeout);
    });
    try {
      const [response] = await Promise.all([result, send()]);
      return response;
    } finally {
      clearTimeout(timer!);
      this.serialResponses.delete(listener!);
    }
  }

  private async writeProjectFile(
    directory: FileSystemDirectoryHandle,
    fileName: string,
    content: Uint8Array
  ): Promise<boolean> {
    let operation: FileWriteOperation = "open-file";
    let writable: FileSystemWritableFileStream | undefined;
    try {
      const parts = fileName.split("/");
      if (
        !parts.every(
          (part) =>
            part &&
            part !== "." &&
            part !== ".." &&
            !part.includes("\\") &&
            !part.includes("\0")
        )
      )
        throw new Error("Invalid project file path");
      let parent = directory;
      for (const part of parts.slice(0, -1))
        parent = await parent.getDirectoryHandle(part, { create: true });
      const leaf = parts[parts.length - 1];
      let present = true;
      let handle: FileSystemFileHandle;
      try {
        handle = await parent.getFileHandle(leaf);
      } catch (cause) {
        if (!(cause instanceof DOMException) || cause.name !== "NotFoundError")
          throw cause;
        present = false;
        handle = await parent.getFileHandle(leaf, { create: true });
      }
      operation = "read-file";
      const existing = await handle.getFile();
      if (present && existing.size === content.length) {
        const bytes = new Uint8Array(await existing.arrayBuffer());
        // Compare the actual target each time: another editor may have changed
        // it since our last transfer. Avoid a replacement save for equal bytes.
        if (
          bytes.length === content.length &&
          bytes.every((byte, index) => byte === content[index])
        )
          return false;
      }
      operation = "create-writer";
      writable = await handle.createWritable();
      operation = "write-file";
      await writable.write(content.slice());
      operation = "close-file";
      await writable.close();
      return true;
    } catch (cause) {
      // Cleanup must not hide the original filesystem error (including close()).
      await writable?.abort().catch(() => {});
      let code: CircuitPythonErrorCode = "write";
      if (cause instanceof DOMException) {
        switch (cause.name) {
          case "NoModificationAllowedError":
            code = "filesystem-state";
            break;
          case "NotAllowedError":
          case "SecurityError":
            code = "permission";
            break;
          case "QuotaExceededError":
            code = "storage-full";
            break;
        }
      }
      throw new CircuitPythonError(code, cause, { fileName, operation });
    }
  }

  async disconnect(): Promise<void> {
    const port = this.port;
    this.port = undefined;
    this.directoryHandle = undefined;
    try {
      await this.reader?.cancel();
      await this.reading;
      await this.writes.catch(() => {});
      await port?.close();
    } finally {
      this.setStatus(ConnectionStatus.Disconnected);
    }
  }

  clearDevice(): void {
    void this.disconnect().catch((e) =>
      this.options.logging.error("Disconnect failed", e)
    );
  }

  serialWrite(data: string): Promise<void> {
    // Terminal keystrokes must not restart the board during a transfer.
    if (this.flashing) return Promise.resolve();
    return this.writeSerial(data);
  }

  private writeSerial(data: string | Uint8Array): Promise<void> {
    const port = this.port;
    const write = this.writes
      .catch(() => {})
      .then(async () => {
        if (!port?.writable || this.port !== port)
          throw new CircuitPythonError("not-connected");
        const writer = port.writable.getWriter();
        try {
          await writer.write(
            typeof data === "string" ? new TextEncoder().encode(data) : data
          );
        } finally {
          writer.releaseLock();
        }
      });
    this.writes = write;
    return write;
  }

  getDeviceId(): number {
    return 0;
  }
  setRequestDeviceExclusionFilters(): void {}
  getDevice() {
    return undefined;
  }
  async softwareReset(): Promise<void> {
    await this.serialWrite("\x04");
  }

  private setStatus(status: ConnectionStatus) {
    const previousStatus = this.status;
    this.status = status;
    this.dispatchEvent("status", { status, previousStatus });
  }
}
