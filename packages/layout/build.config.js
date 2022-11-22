/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { viteStaticCopy } = require('vite-plugin-static-copy');

const rootPackagePath = path.resolve(__dirname, '../');
/* eslint-disable no-undef */
// 开发模式默认读取 index.html 作为开发模式入口
// entry 作为打包库入口
module.exports = {
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
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: path.resolve(rootPackagePath, './render/dist/index.umd.js'),
            dest: path.resolve(__dirname, './dist/'),
            rename: 'render.umd.js',
          },
          {
            src: path.resolve(
              rootPackagePath,
              './render/dist/index.umd.js.map'
            ),
            dest: path.resolve(__dirname, './dist/'),
            rename: 'render.umd.js.map',
          },
        ],
      }),
    ],
  },
};
