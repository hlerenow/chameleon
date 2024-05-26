import path from 'path';
import fs from 'fs-extra';
import { LibraryOptions, UserConfig, loadConfigFromFile } from 'vite';
import argv from 'yargs-parser';

const cliArgs: {
  dev: boolean;
  build: boolean;
  watch: boolean;
  analyze: boolean;
  generateDTS: boolean;
  sourcemap: boolean;
} = argv(process.argv.slice(2)) as any;

export const CLI_ARGS_OBJ = cliArgs;

export const PROJECT_ROOT = path.resolve(process.cwd());

let customConfigPath = `${PROJECT_ROOT}/build.config.js`;

if (!fs.pathExistsSync(customConfigPath)) {
  customConfigPath = `${PROJECT_ROOT}/build.config.ts`;
}

export type BuildScriptConfig = {
  libMode?: boolean;
  entry: string;
  libName?: string;
  fileName?: string;
  external?: string[];
  global?: Record<string, string>;
  formats?: LibraryOptions['formats'];
  vite?: UserConfig;
};

export let CUSTOM_CONFIG: BuildScriptConfig = null as any;
export const isBuild = !!process.env.VITE_TEST_BUILD;

export const getCustomConfig = async () => {
  if (CUSTOM_CONFIG) {
    return CUSTOM_CONFIG;
  }

  if (fs.pathExistsSync(customConfigPath)) {
    const customConfig = await loadConfigFromFile({} as any, customConfigPath, PROJECT_ROOT);
    CUSTOM_CONFIG = customConfig?.config as BuildScriptConfig;
    return customConfig?.config as BuildScriptConfig;
  }
};
