/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const path = require('path');
const { viteStaticCopy } = require('vite-plugin-static-copy');
const { visualizer } = require('rollup-plugin-visualizer');
const rootPackagePath = path.resolve(__dirname, '../');

// 开发模式默认读取 index.html 作为开发模式入口
// entry 作为打包库入口
const plugins = [
  viteStaticCopy({
    targets: [
      {
        src: path.resolve(rootPackagePath, './layout/dist/index.umd.js'),
        dest: path.resolve(__dirname, './dist/'),
        rename: 'render.umd.js',
      },
      {
        src: path.resolve(rootPackagePath, './layout/dist/index.umd.js.map'),
        dest: path.resolve(__dirname, './dist/'),
        rename: 'render.umd.js.map',
      },
    ],
  }),
];

if (process.env.ANALYZE) {
  plugins.push(
    visualizer({
      open: true,
      emitFile: false,
      gzipSize: true,
      brotliSize: true,
    })
  );
}

module.exports = {
  libMode: process.env.BUILD_TYPE !== 'APP',
  entry: './src/Engine.tsx',
  libName: 'CEngine',
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

    plugins: plugins,
  },
};
