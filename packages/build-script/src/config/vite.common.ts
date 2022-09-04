import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import eslint from 'vite-plugin-eslint';
import dts from 'vite-plugin-dts';
import { PROJECT_ROOT, CUSTOM_CONFIG } from './base';

// https://vitejs.dev/config/
export const commonConfig = () => {
  if (!CUSTOM_CONFIG.entry) {
    throw new Error('entry not find');
  }
  return defineConfig({
    root: PROJECT_ROOT,
    build: {
      lib: {
        entry: path.resolve(PROJECT_ROOT, CUSTOM_CONFIG.entry),
        formats: CUSTOM_CONFIG.formats || ['cjs', 'es'],
        fileName: (format) => `${CUSTOM_CONFIG.fileName || CUSTOM_CONFIG.libName}.${format}.js`,
      },
      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: CUSTOM_CONFIG.external || [],
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          globals: CUSTOM_CONFIG.global || {},
        },
      },
    },
    plugins: [eslint(), react(), dts()],
  });
};
