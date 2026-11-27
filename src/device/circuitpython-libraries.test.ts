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
    load: createCircuitPythonLibraryLoader("/test/", { channel: null }),
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

function channels() {
  vi.stubGlobal("crypto", webcrypto);
  const responses = new Map<string, Uint8Array>();
  const encode = (value: unknown) =>
    new TextEncoder().encode(JSON.stringify(value));
  const hash = (bytes: Uint8Array) =>
    createHash("sha256").update(bytes).digest("hex");
  const version = (release: string, dependency = false, firmwareMajor = 10) => {
    const assetRoot = `circuitpython/versions/test-${release}${
      firmwareMajor === 10 ? "" : `-${firmwareMajor}`
    }/`;
    const modules: Record<
      string,
      { version: string; dependencies: string[]; sha256: string }
    > = {};
    for (const name of dependency ? ["demo", "helper"] : ["demo"]) {
      const data = new TextEncoder().encode(`${name}:${release}`);
      const payload = encode({
        name,
        files: [
          {
            path: `lib/${name}.py`,
            data: Buffer.from(data).toString("base64"),
            sha256: hash(data),
          },
        ],
      });
      responses.set(`/test/${assetRoot}${name}.json`, payload);
      modules[name] = {
        version: release,
        dependencies: name === "demo" && dependency ? ["helper"] : [],
        sha256: hash(payload),
      };
    }
    const catalog = encode({ release, firmwareMajor, assetRoot, modules });
    responses.set(`/test/${assetRoot}catalog.json`, catalog);
    return encode({
      schemaVersion: 1,
      catalog: `${assetRoot}catalog.json`,
      sha256: hash(catalog),
    });
  };
  const a = version("20260101");
  const b = version("20260102", true);
  const pointers = new Map<number, Uint8Array>([[10, a]]);
  let firmwareMajor = 10;
  const fetch = vi.fn(async (url: string) => {
    const match = url.match(/current-(\d+)(?:-test)?\.json$/);
    const bytes = match ? pointers.get(Number(match[1])) : responses.get(url);
    if (!bytes) throw new Error(`Missing fixture: ${url}`);
    return { ok: true, arrayBuffer: async () => bytes.slice().buffer };
  });
  vi.stubGlobal("fetch", fetch);
  const directory = {
    getFileHandle: async () => ({
      getFile: async () => ({
        text: async () => `Adafruit CircuitPython ${firmwareMajor}.3.0`,
      }),
    }),
  } as unknown as FileSystemDirectoryHandle;
  const load = createCircuitPythonLibraryLoader("/test/");
  return {
    load,
    directory,
    fetch,
    responses,
    a,
    b,
    version,
    setFirmware: (major: number) => {
      firmwareMajor = major;
    },
    select: (pointer: Uint8Array, major = 10) => {
      pointers.set(major, pointer);
    },
  };
}

it("switches catalogs A to B and refreshes dependencies and cached payloads without an editor release", async () => {
  const { load, directory, select, b } = channels();
  const first = await load.prepare(project("import demo"), directory);
  expect(new TextDecoder().decode(first.files["lib/demo.py"])).toBe(
    "demo:20260101"
  );
  expect(first.modules).not.toContain("helper");
  select(b);
  const second = await load.prepare(project("import demo"), directory);
  expect(second.release).toBe("20260102");
  expect(new TextDecoder().decode(second.files["lib/demo.py"])).toBe(
    "demo:20260102"
  );
  expect(second.files["lib/helper.py"]).toBeDefined();
  expect(second.modules).toContain("helper");
});

it("freezes one catalog for an entire preparation even if the channel changes during downloads", async () => {
  const { load, directory, select, b, fetch } = channels();
  const original = fetch.getMockImplementation()!;
  fetch.mockImplementation(async (url) => {
    if (url.endsWith("demo.json")) select(b);
    return original(url);
  });
  expect((await load.prepare(project("import demo"), directory)).release).toBe(
    "20260101"
  );
  expect((await load.prepare(project("import demo"), directory)).release).toBe(
    "20260102"
  );
});

it("keeps the last prepared catalog when the channel or catalog becomes unavailable or corrupt", async () => {
  const { load, directory, select, b, responses, fetch } = channels();
  await load.prepare(project("import demo"), directory);
  select(new TextEncoder().encode("invalid"));
  expect((await load.prepare(project("import demo"), directory)).release).toBe(
    "20260101"
  );
  select(b);
  responses.set(
    "/test/circuitpython/versions/test-20260102/catalog.json",
    new TextEncoder().encode("damaged")
  );
  expect((await load.prepare(project("import demo"), directory)).release).toBe(
    "20260101"
  );
  fetch.mockRejectedValueOnce(new Error("offline"));
  expect((await load.prepare(project("import demo"), directory)).release).toBe(
    "20260101"
  );
});

it("does not accept a new catalog when a required payload fails verification", async () => {
  const { load, directory, select, b, responses } = channels();
  await load.prepare(project("import demo"), directory);
  select(b);
  responses.set(
    "/test/circuitpython/versions/test-20260102/helper.json",
    new Uint8Array([1])
  );
  await expect(
    load.prepare(project("import demo"), directory)
  ).rejects.toMatchObject({ moduleName: "helper" });
  select(new Uint8Array([1]));
  expect((await load.prepare(project("import demo"), directory)).release).toBe(
    "20260101"
  );
});

it("uses the built-in fallback when no channel is available and isolates the test channel", async () => {
  const { directory, fetch } = channels();
  fetch.mockRejectedValueOnce(new Error("offline"));
  const fallback = createCircuitPythonLibraryLoader("/test/", {
    channel: "test",
  });
  const plan = await fallback.prepare(project("import board"), directory);
  expect(plan.release).toBe(catalog.release);
  expect(fetch.mock.calls[0][0]).toBe(
    "/test/circuitpython/current-10-test.json"
  );
});

it("rejects a hash-valid catalog for another firmware major and unsafe pointer paths", async () => {
  const { load, directory, select, b, responses, fetch } = channels();
  await load.prepare(project("import demo"), directory);
  const path = "/test/circuitpython/versions/test-20260102/catalog.json";
  const invalid = JSON.parse(new TextDecoder().decode(responses.get(path)));
  invalid.firmwareMajor = 11;
  const bytes = new TextEncoder().encode(JSON.stringify(invalid));
  responses.set(path, bytes);
  const pointer = JSON.parse(new TextDecoder().decode(b));
  pointer.sha256 = createHash("sha256").update(bytes).digest("hex");
  select(new TextEncoder().encode(JSON.stringify(pointer)));
  expect((await load.prepare(project("import demo"), directory)).release).toBe(
    "20260101"
  );
  pointer.catalog = "circuitpython/versions/../../other/catalog.json";
  select(new TextEncoder().encode(JSON.stringify(pointer)));
  expect((await load.prepare(project("import demo"), directory)).release).toBe(
    "20260101"
  );
  expect(fetch.mock.calls.some(([url]) => url.includes("../"))).toBe(false);
});

it.each([11, 23])(
  "loads new libraries for firmware %i without hard-coded major support",
  async (major) => {
    const { load, directory, setFirmware, version, select, fetch } = channels();
    select(version("20260103", true, major), major);
    setFirmware(major);
    const plan = await load.prepare(project("import demo"), directory);
    expect(plan.release).toBe("20260103");
    expect(new TextDecoder().decode(plan.files["lib/demo.py"])).toBe(
      "demo:20260103"
    );
    expect(plan.files["lib/helper.py"]).toBeDefined();
    expect(fetch.mock.calls[0][0]).toBe(
      `/test/circuitpython/current-${major}.json`
    );
  }
);

it("keeps last-good catalogs separate when switching between firmware majors", async () => {
  const { load, directory, setFirmware, version, select } = channels();
  await load.prepare(project("import demo"), directory);
  select(version("20260103", true, 11), 11);
  setFirmware(11);
  expect((await load.prepare(project("import demo"), directory)).release).toBe(
    "20260103"
  );
  select(new Uint8Array([0]), 11);
  expect((await load.prepare(project("import demo"), directory)).release).toBe(
    "20260103"
  );
  setFirmware(10);
  select(new Uint8Array([0]));
  const ten = await load.prepare(project("import demo"), directory);
  expect(ten.release).toBe("20260101");
  expect(ten.files["lib/helper.py"]).toBeUndefined();
  expect(ten.modules).not.toContain("helper");
});

it("never falls back to 10.x libraries on an 11.x board when its channel is missing", async () => {
  const { load, directory, setFirmware, fetch } = channels();
  await load.prepare(project("import demo"), directory);
  setFirmware(11);
  await expect(
    load.prepare(project("import neopixel"), directory)
  ).rejects.toMatchObject({
    moduleName: "adafruit_pixelbuf",
    cause: { message: "No bundle available for CircuitPython 11.x" },
  });
  expect(fetch.mock.calls.some(([url]) => url.endsWith("neopixel.json"))).toBe(
    false
  );
});

it("allows firmware-only projects on a new major without borrowing another major's cleanup catalog", async () => {
  const { load, directory, setFirmware } = channels();
  setFirmware(11);
  expect(await load.prepare(project("import board"), directory)).toEqual({
    files: {},
    modules: [],
    release: "unavailable",
  });
});
