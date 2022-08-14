/* eslint-disable no-undef */
// 开发模式默认读取 index.html 作为开发模式入口
// entry 作为打包库入口
module.exports = {
  entry: './src/App.tsx',
  libName: 'Ddemo',
  external: ['react', 'react-dom'],
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  // 额外的 vite 配置
  vite: {},
};
