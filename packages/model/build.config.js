// 开发模式默认读取 index.html 作为开发模式入口
// entry 作为打包库入口
export default {
  entry: './src/index.ts',
  libName: 'CModel',
  fileName: 'index',
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
};
