import { getCommonConfig } from './vite.common';
import { getCustomConfig } from './base';
import { mergeConfig } from 'vite';

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
  const finalConfig = mergeConfig(config, CUSTOM_CONFIG?.vite || {});
  // const fp = `${PROJECT_ROOT}/.temp.vite.config.json`;

  return finalConfig;
};
