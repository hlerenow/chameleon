import { mergeConfig } from 'vite';
import { CLI_ARGS_OBJ, CUSTOM_CONFIG, PROJECT_ROOT } from './base';
import commonConfig from './vite.common';

let config = mergeConfig(commonConfig, {
  root: PROJECT_ROOT,
  mode: 'production',
  configFile: false,
  build: {
    watch: CLI_ARGS_OBJ.watch ?? false,
  },
});

// https://vitejs.dev/config/
export default mergeConfig(config, CUSTOM_CONFIG.vite || {});
