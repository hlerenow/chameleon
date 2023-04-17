import { mergeConfig } from 'vite';
import { getCommonConfig } from './vite.common';
import { getCustomConfig } from './base';

// https://vitejs.dev/config/
export const devConfig = async () => {
  const CUSTOM_CONFIG = await getCustomConfig();
  const commonConfig = await getCommonConfig();

  const config = mergeConfig(commonConfig, {
    mode: 'development',
    configFile: false,
    server: {
      port: 3000,
    },
  });
  return mergeConfig(config, CUSTOM_CONFIG?.vite || {});
};
