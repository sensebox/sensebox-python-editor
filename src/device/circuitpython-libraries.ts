/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { pythonLanguage } from "@codemirror/lang-python";
import { toByteArray } from "base64-js";
import catalogData from "./libraries/catalog.json";
import { CircuitPythonLibraryError } from "./circuitpython-library-error";

export interface LibraryCatalog {
  release: string;
  firmwareMajor: number;
  assetRoot: string;
  modules: Record<
    string,
    { version: string; dependencies: string[]; sha256: string }
  >;
}
interface LibraryPayload {
  name: string;
  files: { path: string; data: string; sha256: string }[];
}
export interface CircuitPythonLibraryPlan {
  files: Record<string, Uint8Array>;
  modules: string[];
  release: string;
}

const relativePath = (path: string) =>
  path
    .split("/")
    .every(
      (part) => /^[A-Za-z0-9_.-]+$/.test(part) && part !== "." && part !== ".."
    );

function validateCatalog(
  value: unknown,
  firmwareMajor: number
): LibraryCatalog {
  const catalog = value as LibraryCatalog;
  if (
    !catalog ||
    !/^\d{8}$/.test(catalog.release) ||
    catalog.firmwareMajor !== firmwareMajor ||
    typeof catalog.assetRoot !== "string" ||
    !catalog.assetRoot.startsWith("circuitpython/versions/") ||
    !relativePath(catalog.assetRoot.slice(0, -1)) ||
    !catalog.assetRoot.endsWith("/") ||
    !catalog.modules ||
    typeof catalog.modules !== "object" ||
    Array.isArray(catalog.modules) ||
    !Object.keys(catalog.modules).length
  )
    throw new Error("Invalid library catalog");
  for (const [name, info] of Object.entries(catalog.modules)) {
    if (
      !/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ||
      !info ||
      typeof info.version !== "string" ||
      !/^[a-f0-9]{64}$/.test(info.sha256) ||
      !Array.isArray(info.dependencies) ||
      !info.dependencies.every(
        (dependency) =>
          typeof dependency === "string" &&
          Object.prototype.hasOwnProperty.call(catalog.modules, dependency)
      )
    )
      throw new Error("Invalid library module");
  }
  return catalog;
}

async function fetchBytes(
  url: string,
  timeout: number,
  fresh = false
): Promise<Uint8Array> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      ...(fresh ? { cache: "no-store" as const } : {}),
    });
    if (!response.ok) throw new Error(`Library HTTP ${response.status}`);
    return canonicalLibraryPayload(
      new Uint8Array(await response.arrayBuffer())
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Parse syntax, not text matches: comments, strings and aliases are not imports. */
export function pythonImports(source: string): string[] {
  const imports: string[] = [];
  pythonLanguage.parser.parse(source).iterate({
    enter(ref) {
      if (ref.name !== "ImportStatement") return;
      const statement = ref.node;
      const first = statement.firstChild;
      if (first?.name === "from") {
        let module = "";
        for (
          let token = first.nextSibling;
          token && token.name !== "import";
          token = token.nextSibling
        ) {
          if (["VariableName", ".", "..."].includes(token.name))
            module += source.slice(token.from, token.to);
        }
        if (module) {
          imports.push(module);
          let alias = false;
          for (
            let token = statement.getChild("import")?.nextSibling;
            token;
            token = token.nextSibling
          ) {
            if (token.name === "as") alias = true;
            else if (token.name === ",") alias = false;
            else if (token.name === "VariableName" && !alias)
              imports.push(
                module +
                  (module.endsWith(".") ? "" : ".") +
                  source.slice(token.from, token.to)
              );
          }
        }
      } else if (first?.name === "import") {
        let module = "";
        let alias = false;
        for (let token = first.nextSibling; token; token = token.nextSibling) {
          if (token.name === ",") {
            if (module) imports.push(module);
            module = "";
            alias = false;
          } else if (token.name === "as") alias = true;
          else if (!alias && ["VariableName", "."].includes(token.name))
            module += source.slice(token.from, token.to);
        }
        if (module) imports.push(module);
      }
      return false;
    },
  });
  return [...new Set(imports)];
}

export function requiredCircuitPythonLibraries(
  project: Record<string, Uint8Array>,
  catalog: LibraryCatalog = catalogData
): string[] {
  const required = new Set<string>();
  const visited = new Set<string>();
  const decoder = new TextDecoder();
  const local = (name: string) =>
    [
      name + ".py",
      name + ".mpy",
      name + "/__init__.py",
      name + "/__init__.mpy",
    ].find((path) => Object.prototype.hasOwnProperty.call(project, path));
  const visit = (path: string) => {
    if (visited.has(path) || !path.endsWith(".py")) return;
    visited.add(path);
    for (const module of pythonImports(decoder.decode(project[path]))) {
      const relative = module.match(/^\.+/)?.[0].length ?? 0;
      let prefix = "";
      if (relative) {
        const parts = path.split("/").slice(0, -1);
        if (relative - 1 > parts.length) continue;
        prefix = parts.slice(0, parts.length - relative + 1).join("/");
        if (prefix) prefix += "/";
      }
      const name = prefix + module.slice(relative).replaceAll(".", "/");
      const own = local(name) ?? (!relative ? local("lib/" + name) : undefined);
      // A project module shadows a similarly named downloadable library.
      const root = module.split(".")[0];
      const shadow = !relative && (local(root) ?? local("lib/" + root));
      if (own) {
        const parents = own.split("/").slice(0, -1);
        for (let count = 1; count <= parents.length; count++) {
          if (count === 1 && parents[0] === "lib") continue;
          const init = parents.slice(0, count).join("/") + "/__init__.py";
          if (
            init !== own &&
            Object.prototype.hasOwnProperty.call(project, init)
          )
            visit(init);
        }
        visit(own);
      } else if (shadow) visit(shadow);
      else if (
        !relative &&
        Object.prototype.hasOwnProperty.call(catalog.modules, root)
      )
        required.add(root);
    }
  };
  if (project["code.py"]) visit("code.py");
  else for (const path of Object.keys(project)) visit(path);
  const ordered: string[] = [];
  const seen = new Set<string>();
  const dependency = (name: string) => {
    if (seen.has(name)) return;
    seen.add(name);
    const own = local(name) ?? local("lib/" + name);
    if (own) {
      visit(own);
      return;
    }
    if (!catalog.modules[name]) throw new CircuitPythonLibraryError(name);
    for (const child of catalog.modules[name].dependencies) dependency(child);
    ordered.push(name);
  };
  for (const name of required) dependency(name);
  return ordered;
}

async function sha256(bytes: Uint8Array): Promise<string> {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest("SHA-256", bytes.slice().buffer)),
    (byte) => byte.toString(16).padStart(2, "0")
  ).join("");
}

/**
 * Git can check generated text assets out with a final CRLF on Windows even
 * though their pinned digest was generated with LF. Normalize only that one
 * generated line ending; all other byte changes still fail integrity checks.
 */
function canonicalLibraryPayload(bytes: Uint8Array): Uint8Array {
  const length = bytes.length;
  if (length >= 2 && bytes[length - 2] === 0x0d && bytes[length - 1] === 0x0a) {
    const canonical = new Uint8Array(length - 1);
    canonical.set(bytes.subarray(0, length - 2));
    canonical[length - 2] = 0x0a;
    return canonical;
  }
  return bytes;
}

export function createCircuitPythonLibraryLoader(
  baseUrl: string,
  options: { channel?: "stable" | "test" | null } = {}
) {
  const channel = options.channel === undefined ? "stable" : options.channel;
  const lastCatalogs = new Map<number, LibraryCatalog>([
    [catalogData.firmwareMajor, catalogData],
  ]);
  const managedModuleNames = new Map<number, Set<string>>([
    [catalogData.firmwareMajor, new Set(Object.keys(catalogData.modules))],
  ]);
  const selectCatalog = async (
    firmwareMajor: number
  ): Promise<LibraryCatalog | undefined> => {
    if (!channel) return lastCatalogs.get(firmwareMajor);
    try {
      const pointer = JSON.parse(
        new TextDecoder().decode(
          await fetchBytes(
            `${baseUrl}circuitpython/current-${firmwareMajor}${
              channel === "test" ? "-test" : ""
            }.json`,
            3000,
            true
          )
        )
      ) as { schemaVersion: number; catalog: string; sha256: string };
      if (
        pointer.schemaVersion !== 1 ||
        typeof pointer.catalog !== "string" ||
        !pointer.catalog.startsWith("circuitpython/versions/") ||
        !relativePath(pointer.catalog) ||
        !/^[a-f0-9]{64}$/.test(pointer.sha256)
      )
        throw new Error("Invalid library channel");
      const bytes = await fetchBytes(`${baseUrl}${pointer.catalog}`, 15000);
      if ((await sha256(bytes)) !== pointer.sha256)
        throw new Error("Catalog checksum mismatch");
      const catalog = validateCatalog(
        JSON.parse(new TextDecoder().decode(bytes)),
        firmwareMajor
      );
      if (pointer.catalog !== catalog.assetRoot + "catalog.json")
        throw new Error("Catalog path mismatch");
      return catalog;
    } catch {
      // Metadata failures never switch cleanup to a partly fetched catalog.
      return lastCatalogs.get(firmwareMajor);
    }
  };
  const cache = new Map<string, Promise<Record<string, Uint8Array>>>();
  const load = (
    catalog: LibraryCatalog,
    name: string
  ): Promise<Record<string, Uint8Array>> => {
    const key = `${catalog.assetRoot}${name}:${catalog.modules[name].sha256}`;
    let pending = cache.get(key);
    if (!pending) {
      pending = (async () => {
        try {
          const bytes = await fetchBytes(
            `${baseUrl}${catalog.assetRoot}${name}.json`,
            15000
          );
          if ((await sha256(bytes)) !== catalog.modules[name].sha256)
            throw new Error("Library payload checksum mismatch");
          const payload: LibraryPayload = JSON.parse(
            new TextDecoder().decode(bytes)
          );
          if (payload.name !== name || !Array.isArray(payload.files))
            throw new Error("Invalid library payload");
          const result: Record<string, Uint8Array> = Object.create(null);
          for (const file of payload.files) {
            if (
              !file.path
                .split("/")
                .every(
                  (part) =>
                    part &&
                    part !== "." &&
                    part !== ".." &&
                    !part.includes("\\") &&
                    !part.includes("\0")
                ) ||
              (!file.path.startsWith("lib/") &&
                !["font5x8.bin", "font5x8.bin.license"].includes(file.path))
            )
              throw new Error("Invalid library destination");
            const content = toByteArray(file.data);
            if ((await sha256(content)) !== file.sha256)
              throw new Error("Library file checksum mismatch");
            result[file.path] = content;
          }
          return result;
        } catch (cause) {
          cache.delete(key);
          throw new CircuitPythonLibraryError(name, cause);
        }
      })();
      cache.set(key, pending);
    }
    return pending;
  };
  const prepare = async (
    project: Record<string, Uint8Array>,
    directory: FileSystemDirectoryHandle
  ): Promise<CircuitPythonLibraryPlan> => {
    const readFirmwareMajor = async () => {
      const boot = await (
        await (await directory.getFileHandle("boot_out.txt")).getFile()
      ).text();
      const major = Number(boot.match(/CircuitPython\s+(\d+)\./)?.[1]);
      if (!Number.isSafeInteger(major) || major < 1)
        throw new Error("Unknown CircuitPython firmware");
      return major;
    };
    let firmwareMajor = catalogData.firmwareMajor;
    if (channel) {
      try {
        firmwareMajor = await readFirmwareMajor();
      } catch (cause) {
        throw new CircuitPythonLibraryError("CircuitPython", cause);
      }
    }
    const catalog = await selectCatalog(firmwareMajor);
    if (!catalog) {
      const known = requiredCircuitPythonLibraries(project);
      if (known.length)
        throw new CircuitPythonLibraryError(
          known[0],
          new Error(`No bundle available for CircuitPython ${firmwareMajor}.x`)
        );
      // Firmware-only projects can still transfer without a matching library
      // catalog. Do not use another major's catalog to clean this board.
      return { files: {}, modules: [], release: "unavailable" };
    }
    const names = requiredCircuitPythonLibraries(project, catalog);
    const plan = (
      files: Record<string, Uint8Array>
    ): CircuitPythonLibraryPlan => {
      lastCatalogs.set(firmwareMajor, catalog);
      const managedModules =
        managedModuleNames.get(firmwareMajor) ?? new Set<string>();
      for (const name of Object.keys(catalog.modules)) managedModules.add(name);
      managedModuleNames.set(firmwareMajor, managedModules);
      return {
        files,
        release: catalog.release,
        modules: [...managedModules],
      };
    };
    if (!names.length) return plan({});
    try {
      if (
        (channel ? firmwareMajor : await readFirmwareMajor()) !==
        catalog.firmwareMajor
      )
        throw new Error(
          `The library bundle requires CircuitPython ${catalog.firmwareMajor}.x`
        );
    } catch (cause) {
      throw new CircuitPythonLibraryError(names[0], cause);
    }
    // Download every dependency before touching the drive, in small parallel batches.
    const result: Record<string, Uint8Array> = Object.create(null);
    for (let offset = 0; offset < names.length; offset += 6) {
      for (const files of await Promise.all(
        names.slice(offset, offset + 6).map((name) => load(catalog, name))
      ))
        Object.assign(result, files);
    }
    return plan(result);
  };
  const loader = async (
    project: Record<string, Uint8Array>,
    directory: FileSystemDirectoryHandle
  ) => (await prepare(project, directory)).files;
  return Object.assign(loader, { prepare });
}
