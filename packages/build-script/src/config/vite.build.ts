import { CLI_ARGS_OBJ, PROJECT_ROOT, getCustomConfig } from './base';
import { getCommonConfig } from './vite.common';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

import dts from 'vite-plugin-dts';
import { mergeConfig, type LibraryFormats } from 'vite';

const generateDTS = CLI_ARGS_OBJ.generateDTS;

// https://vitejs.dev/config/
export const buildConfig = async function (specifiedFormats?: LibraryFormats[], keepOutDir: boolean = false) {
  const CUSTOM_CONFIG = await getCustomConfig();
  const commonConfig = await getCommonConfig(specifiedFormats);

  const plugins: any[] = [];

  // 只在第一次构建时生成 DTS（非 umd 单独构建时）
  if (generateDTS !== false && !keepOutDir) {
    plugins.push(
      dts({
        entryRoot: path.resolve(PROJECT_ROOT, './src'),
        compilerOptions: {
          skipDefaultLibCheck: false,
        },
      })
    );
  }

  if (CLI_ARGS_OBJ.analyze) {
    plugins.push(
      visualizer({
        open: true,
      })
    );
  }

  const config = mergeConfig(commonConfig, {
    mode: 'production',
    configFile: false,
    build: {
      watch: CLI_ARGS_OBJ.watch ?? false,
      emptyOutDir: !keepOutDir, // 如果 keepOutDir 为 true，不清空输出目录
    },
    plugins: plugins,
  });

  // 合并自定义 vite 配置
  // 注意：如果自定义配置中设置了 build.rollupOptions，它会覆盖基础配置
  // 因此建议在自定义配置中明确设置完整的 rollupOptions
  const finalConfig = mergeConfig(config, CUSTOM_CONFIG?.vite || {});
  return finalConfig;
};
