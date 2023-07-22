import path from 'path';

const layoutEntry = path.resolve(__dirname, 'index.html');
const renderEntry = path.resolve(__dirname, './src/_dev_/render.html');

let inputConfig = {};

if (process.env.NODE_ENV === 'development') {
  inputConfig = {
    input: {
      main: layoutEntry,
      nested: renderEntry,
    },
  };
}

const mainConfig = {
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
    build: {
      copyPublicDir: false,
      rollupOptions: {
        ...inputConfig,
      },
    },
    plugins: [],
  },
};

const config = mainConfig;

module.exports = config;
