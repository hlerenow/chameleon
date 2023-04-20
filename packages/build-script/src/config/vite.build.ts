import { mergeConfig } from 'vite';
import { CLI_ARGS_OBJ, PROJECT_ROOT, getCustomConfig } from './base';
import { getCommonConfig } from './vite.common';
import { visualizer } from 'rollup-plugin-visualizer';
import dts from 'vite-plugin-dts';
import path from 'path';

const plugins: any[] = [
  dts({
    entryRoot: path.resolve(PROJECT_ROOT, './src'),
    compilerOptions: {
      skipDefaultLibCheck: false,
    },
  }),
];

if (CLI_ARGS_OBJ.analyze) {
  plugins.push(
    visualizer({
      open: true,
    })
  );
}
// https://vitejs.dev/config/
export const buildConfig = async function () {
  const CUSTOM_CONFIG = await getCustomConfig();
  const commonConfig = await getCommonConfig();

  const config = mergeConfig(commonConfig, {
    mode: 'production',
    configFile: false,
    build: {
      watch: CLI_ARGS_OBJ.watch ?? false,
    },
    plugins: plugins,
  });
  const finalConfig = mergeConfig(config, CUSTOM_CONFIG?.vite || {});
  return finalConfig;
};
