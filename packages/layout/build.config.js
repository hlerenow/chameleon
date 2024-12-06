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
    },
    plugins: [],
  },
};

const config = mainConfig;

export default config;
