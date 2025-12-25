import dts from 'vite-plugin-dts';
import path from 'path';
// 开发模式默认读取 index.html 作为开发模式入口
// entry 作为打包库入口

const env = process.env.BUILD_TYPE === 'PKG' ? 'production' : '';
export default {
  entry: './src/index.ts',
  // formats 会根据构建模式自动设置：生产模式包含 umd，开发模式只有 cjs 和 es
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
