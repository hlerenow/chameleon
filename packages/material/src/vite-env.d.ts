/// <reference types="vite/client" />

/** package version */
declare const __PACKAGE_VERSION__: string;
declare const __PACKAGE_NAME__: string;
declare const __GLOBAL_LIB_NAME__: string;

declare module '*.scss' {
  const content: { [key: string]: any };
  export = content;
}
