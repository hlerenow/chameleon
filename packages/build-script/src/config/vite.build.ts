import { mergeConfig } from 'vite';
import { CLI_ARGS_OBJ, CUSTOM_CONFIG } from './base';
import { commonConfig } from './vite.common';

// https://vitejs.dev/config/
export const buildConfig = function () {
  const config = mergeConfig(commonConfig(), {
    mode: 'production',
    configFile: false,
    build: {
      watch: CLI_ARGS_OBJ.watch ?? false,
    },
  });

  const finalConfig = mergeConfig(config, CUSTOM_CONFIG.vite || {}, false);
  if (CUSTOM_CONFIG.libMode === false) {
    delete finalConfig.build.lib;
  }
  return finalConfig;
};
