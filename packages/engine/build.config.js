/* eslint-disable no-undef */
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
    build: {
      outDir: process.env.BUILD_TYPE === 'APP' ? './example' : './dist',
    },
  },
};
