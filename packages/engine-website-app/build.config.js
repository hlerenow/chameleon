/* eslint-disable no-undef */
import { viteStaticCopy } from 'vite-plugin-static-copy';
import pkg from './package.json';
import commonConfig from './build.common.config';
// 开发模式默认读取 index.html 作为开发模式入口
// entry 作为打包库入口
const plugins = [];

plugins.push(
  viteStaticCopy({
    targets: [
      {
        src: './node_modules/@chamn/render/dist/index.umd.js',
        dest: './',
        rename: 'render.umd.js',
      },
    ],
  })
);

const mainConfig = {
  libMode: false,
  entry: './src/index.tsx',
  fileName: 'index',
  external: [],
  vite: {
    base: '/chameleon/',
    build: {
      outDir: './dist',
      copyPublicDir: true,
    },
    plugins: plugins,
    ...commonConfig,
    define: {
      global: 'globalThis',
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __RUN_MODE__: JSON.stringify(process.env.BUILD_TYPE),
      __PACKAGE_VERSION__: JSON.stringify(pkg.version),
      __BUILD_VERSION__: JSON.stringify(Date.now()),
    },
  },
};

const config = mainConfig;
export default config;
