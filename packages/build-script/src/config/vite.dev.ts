import { mergeConfig } from 'vite';
import { commonConfig } from './vite.common';
import { CUSTOM_CONFIG } from './base';

// https://vitejs.dev/config/
export const devConfig = () => {
  const config = mergeConfig(commonConfig(), {
    mode: 'development',
    configFile: false,
    server: {
      port: 3000,
    },
  });
  return mergeConfig(config, CUSTOM_CONFIG.vite || {});
};
