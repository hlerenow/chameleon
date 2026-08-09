import dts from 'vite-plugin-dts';
import path from 'path';
// 开发模式默认读取 index.html 作为开发模式入口
// entry 作为打包库入口

const env = process.env.BUILD_TYPE === 'PKG' ? 'production' : '';
const mainConfig = {
  entry: './src/index.ts',
  // IIFE is used by browser-only consumers that cannot provide CommonJS globals.
  formats: ['cjs', 'es', 'umd', 'iife'],
  libName: 'CRender',
  fileName: 'index',
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  // 额外的 vite 配置
  vite: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(env),
    },
    plugins: [
      dts({
        entryRoot: path.resolve('./src'),
        compilerOptions: {
          skipDefaultLibCheck: false,
        },
      }),
    ],
  },
};

const codeMapMsgConfig = {
  entry: './src/debug/codeMapMsg.ts',
  libName: 'ChameleonCodeMapMsg',
  fileName: 'code-map-msg',
  formats: ['umd'],
  vite: {
    build: {
      emptyOutDir: false,
      rolldownOptions: {
        output: {
          exports: 'named',
        },
      },
    },
    plugins: [
      dts({
        entryRoot: path.resolve('./src'),
        compilerOptions: {
          skipDefaultLibCheck: false,
        },
      }),
    ],
  },
};

export default process.env.BUILD_ENTRY === 'CODE_MAP_MSG' ? codeMapMsgConfig : mainConfig;
