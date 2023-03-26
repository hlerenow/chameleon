/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const renderConfig = {
  entry: './src/render.ts',
  formats: ['umd'],
  libName: 'CRender',
  fileName: 'render',
  external: ['react', 'react-dom'],
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  // 额外的 vite 配置
  vite: {
    outDir: './public',
  },
};

const mainConfig = {
  entry: './src/index.tsx',
  libName: 'CLayout',
  fileName: 'index',
  external: ['react', 'react-dom'],
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  // 额外的 vite 配置
  vite: {
    build: {
      copyPublicDir: false,
    },
    plugins: [],
  },
};

const config = process.env.BUILD_TYPE === 'Render' ? renderConfig : mainConfig;

module.exports = config;
