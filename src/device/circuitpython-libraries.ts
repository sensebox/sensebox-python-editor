/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { pythonLanguage } from "@codemirror/lang-python";
import { toByteArray } from "base64-js";
import catalogData from "./libraries/catalog.json";
import { CircuitPythonLibraryError } from "./circuitpython-library-error";

interface LibraryCatalog {
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
const catalog: LibraryCatalog = catalogData;

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
  project: Record<string, Uint8Array>
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

export function createCircuitPythonLibraryLoader(baseUrl: string) {
  const cache = new Map<string, Promise<Record<string, Uint8Array>>>();
  const load = (name: string): Promise<Record<string, Uint8Array>> => {
    let pending = cache.get(name);
    if (!pending) {
      pending = (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch(
            `${baseUrl}${catalog.assetRoot}${name}.json`,
            { signal: controller.signal }
          );
          if (!response.ok) throw new Error(`Library HTTP ${response.status}`);
          const bytes = canonicalLibraryPayload(
            new Uint8Array(await response.arrayBuffer())
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
          cache.delete(name);
          throw new CircuitPythonLibraryError(name, cause);
        } finally {
          clearTimeout(timer);
        }
      })();
      cache.set(name, pending);
    }
    return pending;
  };
  return async (
    project: Record<string, Uint8Array>,
    directory: FileSystemDirectoryHandle
  ): Promise<Record<string, Uint8Array>> => {
    const names = requiredCircuitPythonLibraries(project);
    if (!names.length) return {};
    try {
      const boot = await (
        await (await directory.getFileHandle("boot_out.txt")).getFile()
      ).text();
      if (
        Number(boot.match(/CircuitPython\s+(\d+)\./)?.[1]) !==
        catalog.firmwareMajor
      )
        throw new Error("The library bundle requires CircuitPython 10.x");
    } catch (cause) {
      throw new CircuitPythonLibraryError(names[0], cause);
    }
    // Download every dependency before touching the drive, in small parallel batches.
    const result: Record<string, Uint8Array> = Object.create(null);
    for (let offset = 0; offset < names.length; offset += 6) {
      for (const files of await Promise.all(
        names.slice(offset, offset + 6).map(load)
      ))
        Object.assign(result, files);
    }
    return result;
  };
}
