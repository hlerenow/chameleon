import dts from 'vite-plugin-dts';
import path from 'path';
// 开发模式默认读取 index.html 作为开发模式入口
// entry 作为打包库入口

const env = process.env.BUILD_TYPE === 'PKG' ? 'production' : '';
export default {
  entry: './src/index.ts',
  formats: ['es', 'cjs', 'umd'],
  libName: 'CRender',
  fileName: 'index',
  external: ['react', 'react-dom'],
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  // 额外的 vite 配置
  vite: {
    build: {
      lib: {
        fileName: (format, entryName) => {
          if (format === 'umd') {
            return `${entryName}.${format}.js`;
          }
          if (format === 'cjs') {
            return `${entryName}.${format}`;
          }
          return `${entryName}.js`;
        },
      },
    },
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
