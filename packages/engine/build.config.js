/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const path = require('path');
const { viteStaticCopy } = require('vite-plugin-static-copy');
const rootPackagePath = path.resolve(__dirname, '../');

// 开发模式默认读取 index.html 作为开发模式入口
// entry 作为打包库入口
module.exports = {
  libMode: process.env.BUILD_TYPE !== 'APP',
  entry: './src/App.tsx',
  libName: 'Ddemo',
  external: ['react', 'react-dom'],
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  vite: {
    base: process.env.BUILD_TYPE === 'APP' ? '/chameleon/' : '',
    build: {
      outDir: process.env.BUILD_TYPE === 'APP' ? './example' : './dist',
    },
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: path.resolve(rootPackagePath, './layout/dist/index.umd.js'),
            dest: path.resolve(__dirname, './dist/'),
            rename: 'render.umd.js',
          },
          {
            src: path.resolve(
              rootPackagePath,
              './layout/dist/index.umd.js.map'
            ),
            dest: path.resolve(__dirname, './dist/'),
            rename: 'render.umd.js.map',
          },
        ],
      }),
    ],
  },
};
