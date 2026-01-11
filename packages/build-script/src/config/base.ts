import path from 'path';
import fs from 'fs-extra';
import { loadConfigFromFile, type LibraryOptions, type UserConfig } from 'vite';
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

export type ExternalOption = (string | RegExp)[] | ((id: string, importer?: string, isResolved?: boolean) => boolean);

export type BuildScriptConfig = {
  libMode?: boolean;
  entry: string;
  libName?: string;
  fileName?: string;
  /* 样式文件名 */
  cssFileName?: string;
  /* 通用的 external 配置，对所有格式生效 */
  external?: ExternalOption;
  /* 按格式配置不同的 external 规则，优先级高于 external */
  externalByFormat?: {
    es?: ExternalOption;
    cjs?: ExternalOption;
    umd?: ExternalOption;
    iife?: ExternalOption;
  };
  /* 自定义需要排除的别名前缀列表，这些路径不会被外部化
   * 默认值：['@/', '~/', '#/']
   * 示例：['@/', '~/', '$lib/', '@src/']
   */
  externalAlias?: string[];
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
