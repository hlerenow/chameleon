import { mergeConfig } from 'vite';
import commonConfig from './vite.common';
import { CUSTOM_CONFIG, PROJECT_ROOT } from './base';

let config = mergeConfig(commonConfig, {
  root: PROJECT_ROOT,
  mode: 'development',
  configFile: false,
  server: {
    port: 3000,
  },
});

// https://vitejs.dev/config/
export default mergeConfig(config, CUSTOM_CONFIG.vite || {});
