/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const path = require('path');
const pkg = require('./package.json');
const { visualizer } = require('rollup-plugin-visualizer');
const monacoEditorPlugin = require('vite-plugin-monaco-editor').default;

// 开发模式默认读取 index.html 作为开发模式入口
// entry 作为打包库入口
const plugins = [];

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

if (process.env.BUILD_TYPE !== 'PKG') {
  plugins.push(
    monacoEditorPlugin({
      customDistPath: (root, buildOutDir) => {
        return path.resolve(__dirname, './example/monacoeditorwork');
      },
    })
  );
}

const mainConfig = {
  libMode: process.env.BUILD_TYPE !== 'APP',
  entry: './src/index.tsx',
  // libName: 'CEngine',
  fileName: 'index',
  external:
    process.env.BUILD_TYPE === 'APP'
      ? []
      : ['react', 'react-dom', 'monaco-editor', 'antd', '@chamn/model', '@chamn/layout'],
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  vite: {
    base: process.env.BUILD_TYPE === 'APP' ? '/chameleon/' : '',
    build: {
      outDir: process.env.BUILD_TYPE === 'APP' ? './example' : './dist',
      copyPublicDir: process.env.BUILD_TYPE === 'APP',
    },
    plugins: plugins,
    resolve: {
      alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/assets/styles/mixin.scss";',
        },
      },
    },
    define: {
      'process.env': JSON.stringify('{}'),
      __PACKAGE_VERSION__: JSON.stringify(pkg.version),
      __BUILD_VERSION__: JSON.stringify(Date.now()),
    },
  },
};

const renderConfig = {
  entry: './src/_dev_/render.ts',
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
    build: {
      copyPublicDir: false,
      outDir: './public',
    },
    define: {
      'process.env': JSON.stringify('{}'),
      __PACKAGE_VERSION__: JSON.stringify(pkg.version),
      __BUILD_VERSION__: JSON.stringify(Date.now()),
    },
  },
};

const config = process.env.BUILD_TYPE === 'Render' ? renderConfig : mainConfig;
module.exports = config;
