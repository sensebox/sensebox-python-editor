import {
  BoardVersion,
  ConnectionStatus,
  ConnectionStatusChange,
  DeviceError,
  FlashDataSource,
  FlashOptions,
  ProgressStage,
} from "@microbit/microbit-connection";
import { MicrobitUSBConnection } from "@microbit/microbit-connection/usb";
import { Logging } from "../logging/logging";
import { SimpleEventTarget } from "./simple-event-target";

interface WebFileSystemEventMap {
  status: ConnectionStatusChange;
  flash: void;
}

/**
 * A WebFileSystem connection to a CircuitPython device.
 *
 * "Connecting" asks the user to pick the device's drive (e.g. CIRCUITPY) and
 * "flashing" writes the project files to it. We implement the USB connection
 * interface so the rest of the app can treat it like the micro:bit device.
 */
export class WebFileSystemConnection
  extends SimpleEventTarget<WebFileSystemEventMap>
  implements MicrobitUSBConnection
{
  readonly type = "usb" as const;
  status: ConnectionStatus = ConnectionStatus.NoAuthorizedDevice;

  private logging: Logging;
  private files: () => Promise<Record<string, Uint8Array>>;
  private directoryHandle: FileSystemDirectoryHandle | undefined;

  constructor(options: {
    logging: Logging;
    files: () => Promise<Record<string, Uint8Array>>;
  }) {
    super();
    this.logging = options.logging;
    this.files = options.files;
  }

  async initialize(): Promise<void> {
    this.logging.event({ type: "webfilesystem-initialize" });
  }

  async checkAvailability() {
    return "showDirectoryPicker" in window
      ? ("available" as const)
      : ("unsupported" as const);
  }

  dispose(): void {
    this.logging.event({ type: "webfilesystem-dispose" });
  }

  async connect(): Promise<void> {
    try {
      this.directoryHandle = await window.showDirectoryPicker({
        mode: "readwrite",
      });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        throw new DeviceError({ code: "no-device-selected", cause: e });
      }
      throw new DeviceError({ code: "connection-error", cause: e });
    }
    this.setStatus(ConnectionStatus.Connected);
  }

  getBoardVersion(): BoardVersion {
    return "V2";
  }

  /**
   * Write the project files to the selected directory.
   *
   * The hex data source is ignored as CircuitPython runs the files directly.
   */
  async flash(
    _dataSource: FlashDataSource,
    options: FlashOptions
  ): Promise<void> {
    if (!this.directoryHandle) {
      throw new DeviceError({ code: "not-connected" });
    }
    this.logging.event({ type: "webfilesystem-flash" });
    const entries = Object.entries(await this.files());
    let written = 0;
    for (const [fileName, fileContent] of entries) {
      const fileHandle = await this.directoryHandle.getFileHandle(fileName, {
        create: true,
      });
      const writable = await fileHandle.createWritable();
      // slice() gives an ArrayBuffer-backed copy as required by write().
      await writable.write(fileContent.slice());
      await writable.close();
      written++;
      options.progress?.(
        ProgressStage.PartialFlashing,
        written / entries.length
      );
    }
    options.progress?.(ProgressStage.PartialFlashing, undefined);
    this.logging.event({ type: "webfilesystem-flash-complete" });
    this.dispatchEvent("flash");
  }

  async disconnect(): Promise<void> {
    this.directoryHandle = undefined;
    this.setStatus(ConnectionStatus.Disconnected);
  }

  clearDevice(): void {
    this.directoryHandle = undefined;
    this.setStatus(ConnectionStatus.NoAuthorizedDevice);
  }

  // Serial is handled separately via Web Serial in the REPL panel.
  async serialWrite(_data: string): Promise<void> {}
  getDeviceId(): number {
    return 0;
  }
  setRequestDeviceExclusionFilters(): void {}
  getDevice() {
    return undefined;
  }
  async softwareReset(): Promise<void> {}

  private setStatus(newStatus: ConnectionStatus) {
    const previousStatus = this.status;
    this.status = newStatus;
    this.dispatchEvent("status", { status: newStatus, previousStatus });
  }
}
