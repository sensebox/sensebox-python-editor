/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { afterEach, expect, it, vi } from "vitest";
import { createHash, webcrypto } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  createCircuitPythonLibraryLoader,
  pythonImports,
  requiredCircuitPythonLibraries,
} from "./circuitpython-libraries";
import catalog from "./libraries/catalog.json";

const project = (code: string) => ({
  "code.py": new TextEncoder().encode(code),
});
afterEach(() => vi.unstubAllGlobals());
function setup(version = "10.3.0") {
  vi.stubGlobal("crypto", webcrypto);
  const fetch = vi.fn(async (url: string) => {
    const bytes = new Uint8Array(
      await readFile(
        join(process.cwd(), "public", url.replace(/^\/test\//, ""))
      )
    );
    return { ok: true, arrayBuffer: async () => bytes.buffer };
  });
  vi.stubGlobal("fetch", fetch);
  const getFileHandle = vi.fn(async () => ({
    getFile: async () => ({
      text: async () => `Adafruit CircuitPython ${version}`,
    }),
  }));
  return {
    fetch,
    getFileHandle,
    directory: { getFileHandle } as unknown as FileSystemDirectoryHandle,
    load: createCircuitPythonLibraryLoader("/test/"),
  };
}

const canonicalPayload = (bytes: Uint8Array): Uint8Array => {
  if (
    bytes.length >= 2 &&
    bytes[bytes.length - 2] === 0x0d &&
    bytes[bytes.length - 1] === 0x0a
  ) {
    const result = new Uint8Array(bytes.length - 1);
    result.set(bytes.subarray(0, bytes.length - 2));
    result[result.length - 1] = 0x0a;
    return result;
  }
  return bytes;
};

it("parses nested, multiline, dotted and aliased imports without strings or comments", () => {
  expect(
    pythonImports(
      `# import adafruit_fake\ntext = "import adafruit_wrong"\nimport board, adafruit_mpu6050 as sensor\nif True:\n    from adafruit_dps310.basic import (DPS310 as Pressure, Other)\nfrom . import helper\n`
    )
  ).toEqual([
    "board",
    "adafruit_mpu6050",
    "adafruit_dps310.basic",
    "adafruit_dps310.basic.DPS310",
    "adafruit_dps310.basic.Other",
    ".",
    ".helper",
  ]);
});

it("includes transitive dependencies once, before the requested modules", () => {
  expect(
    requiredCircuitPythonLibraries(
      project(
        "import adafruit_ssd1306\nfrom adafruit_ssd1306 import SSD1306_I2C"
      )
    )
  ).toEqual(["adafruit_bus_device", "adafruit_framebuf", "adafruit_ssd1306"]);
  expect(
    requiredCircuitPythonLibraries(
      project(
        "from adafruit_dps310.basic import DPS310\nimport adafruit_mpu6050\nimport neopixel"
      )
    )
  ).toEqual(
    expect.arrayContaining([
      "adafruit_dps310",
      "adafruit_mpu6050",
      "adafruit_register",
      "adafruit_bus_device",
      "neopixel",
      "adafruit_pixelbuf",
    ])
  );
});

it("follows reachable project modules, package initializers and relative imports with cycles", () => {
  const encode = (text: string) => new TextEncoder().encode(text);
  const files = {
    ...project("import pkg.helper"),
    "pkg/__init__.py": encode("import neopixel"),
    "pkg/helper.py": encode("from . import other"),
    "pkg/other.py": encode("import adafruit_mpu6050\nfrom . import helper"),
    "unused.py": encode("import adafruit_ssd1306"),
  };
  const result = requiredCircuitPythonLibraries(files);
  expect(result).toEqual(
    expect.arrayContaining(["neopixel", "adafruit_mpu6050"])
  );
  expect(result).not.toContain("adafruit_ssd1306");
});

it("preserves a user module shadowing a catalog library", () => {
  expect(
    requiredCircuitPythonLibraries({
      ...project("import adafruit_ssd1306"),
      "adafruit_ssd1306.py": new TextEncoder().encode("import board"),
    })
  ).toEqual([]);
  const result = requiredCircuitPythonLibraries({
    ...project("import adafruit_ssd1306"),
    "lib/adafruit_framebuf.py": new TextEncoder().encode("import neopixel"),
  });
  expect(result).not.toContain("adafruit_framebuf");
  expect(result).toContain("neopixel");
});

it("does not fetch libraries or read the board for firmware-only imports", async () => {
  const { load, directory, fetch, getFileHandle } = setup("9.0.0");
  expect(
    await load(project("import board, time, wifi, digitalio"), directory)
  ).toEqual({});
  expect(fetch).not.toHaveBeenCalled();
  expect(getFileHandle).not.toHaveBeenCalled();
});

it("loads compiled OLED libraries, package files and the default font, caching asset downloads", async () => {
  const { load, directory, fetch, getFileHandle } = setup();
  const files = await load(project("import adafruit_ssd1306"), directory);
  expect(files["lib/adafruit_ssd1306.mpy"].slice(0, 2)).toEqual(
    new Uint8Array([67, 6])
  );
  expect(files["lib/adafruit_framebuf.mpy"]).toBeDefined();
  expect(files["lib/adafruit_bus_device/i2c_device.mpy"]).toBeDefined();
  expect(files["font5x8.bin"].length).toBe(1282);
  expect(files["code.py"]).toBeUndefined();
  await load(project("import adafruit_ssd1306"), directory);
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(getFileHandle).toHaveBeenCalledTimes(2);
});

it("installs the senseBox HDC1080 driver for the documented import", async () => {
  const { load, directory } = setup();
  expect(
    requiredCircuitPythonLibraries(project("from hdc1080 import HDC1080"))
  ).toEqual(["adafruit_bus_device", "adafruit_register", "hdc1080"]);
  const files = await load(project("from hdc1080 import HDC1080"), directory);
  const source = new TextDecoder().decode(files["lib/hdc1080.py"]);
  expect(source).toContain("class HDC1080:");
  expect(source).toContain("I2CDevice(i2c, address)");
  expect(source).toContain("def temperature(self):");
  expect(source).toContain("def humidity(self):");
  expect(files["lib/adafruit_bus_device/i2c_device.mpy"]).toBeDefined();
  expect(files["lib/adafruit_register/__init__.mpy"]).toBeDefined();
});

it("installs the senseBox ToF driver and its firmware files", async () => {
  const { load, directory } = setup();
  expect(
    requiredCircuitPythonLibraries(project("from vl53lxcx import VL53L8CX"))
  ).toEqual(["adafruit_bus_device", "adafruit_register", "vl53lxcx"]);
  const files = await load(project("from vl53lxcx import VL53L8CX"), directory);
  expect(files["lib/vl53lxcx/__init__.py"]).toBeDefined();
  expect(files["lib/vl53lxcx/vl53l5cx_fw.bin"]).toBeDefined();
  expect(files["lib/vl53lxcx/vl53l8cx_fw.bin"]).toBeDefined();
  expect(files["lib/vl53lxcx/vl_fw_config.bin"]).toBeDefined();
});

it("installs the ICM20948 IMU library for the documented import", () => {
  expect(
    requiredCircuitPythonLibraries(project("import adafruit_icm20x"))
  ).toEqual(["adafruit_bus_device", "adafruit_register", "adafruit_icm20x"]);
});

it("does not install a library for the built-in RTC time blocks", () => {
  expect(
    requiredCircuitPythonLibraries(project("import rtc\nimport adafruit_ntp"))
  ).toEqual(["adafruit_ntp"]);
});

it("accepts the final CRLF introduced by a Windows Git checkout", async () => {
  const { load, directory, fetch } = setup();
  const path = join(
    process.cwd(),
    "public",
    catalog.assetRoot,
    "adafruit_bus_device.json"
  );
  const canonical = canonicalPayload(new Uint8Array(await readFile(path)));
  const windowsBytes = new Uint8Array(canonical.length + 1);
  windowsBytes.set(canonical.subarray(0, canonical.length - 1));
  windowsBytes[windowsBytes.length - 2] = 0x0d;
  windowsBytes[windowsBytes.length - 1] = 0x0a;
  fetch.mockResolvedValueOnce({
    ok: true,
    arrayBuffer: async () => windowsBytes.buffer,
  });
  const files = await load(project("import adafruit_bus_device"), directory);
  expect(files["lib/adafruit_bus_device/i2c_device.mpy"]).toBeDefined();
});

it("refuses an incompatible firmware before downloading anything", async () => {
  const { load, directory, fetch } = setup("8.2.0");
  await expect(
    load(project("import neopixel"), directory)
  ).rejects.toMatchObject({
    cause: { message: "The library bundle requires CircuitPython 10.x" },
  });
  expect(fetch).not.toHaveBeenCalled();
});

it("rejects damaged payloads and can retry failed downloads", async () => {
  const { load, directory, fetch } = setup();
  fetch.mockRejectedValueOnce(new Error("Offline"));
  await expect(
    load(project("import neopixel"), directory)
  ).rejects.toMatchObject({ moduleName: "adafruit_pixelbuf" });
  const result = await load(project("import neopixel"), directory);
  expect(result["lib/neopixel.mpy"]).toBeDefined();
  const other = setup();
  other.fetch.mockResolvedValueOnce({
    ok: true,
    arrayBuffer: async () => new Uint8Array([1, 2]).buffer,
  });
  await expect(
    other.load(project("import neopixel"), other.directory)
  ).rejects.toMatchObject({
    cause: { message: "Library payload checksum mismatch" },
  });
});

it("ships a complete catalog with matching immutable payload and file hashes", async () => {
  for (const [name, module] of Object.entries(catalog.modules)) {
    for (const dependency of module.dependencies)
      expect(catalog.modules).toHaveProperty(dependency);
    const bytes = await readFile(
      join(process.cwd(), "public", catalog.assetRoot, `${name}.json`)
    );
    const canonical = canonicalPayload(bytes);
    expect(createHash("sha256").update(canonical).digest("hex"), name).toBe(
      module.sha256
    );
    const payload = JSON.parse(bytes.toString("utf8")) as {
      name: string;
      files: { path: string; data: string; sha256: string }[];
    };
    expect(payload.name).toBe(name);
    for (const file of payload.files)
      expect(
        createHash("sha256")
          .update(Buffer.from(file.data, "base64"))
          .digest("hex"),
        file.path
      ).toBe(file.sha256);
  }
});
