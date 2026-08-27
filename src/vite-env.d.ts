/// <reference types="vite/client" />

declare const __APP_BUILD_ID__: string;
declare const __APP_VERSION__: string;
declare const __BUILD_TIMESTAMP__: string;

interface ImportMetaEnv {
  readonly VITE_APP_BUILD_ID?: string;
  readonly VITE_APP_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
