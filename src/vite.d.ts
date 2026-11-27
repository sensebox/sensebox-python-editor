/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VERSION: string;
  readonly VITE_COMMIT_SHA: string;
  readonly VITE_STAGE: string;
  readonly VITE_CIRCUITPYTHON_HOST_FLUSH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
