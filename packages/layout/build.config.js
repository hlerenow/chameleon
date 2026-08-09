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

const debugConfig = {
  ...mainConfig,
  entry: './src/components/LayoutDebug/index.tsx',
  libName: 'CLayoutDebug',
  fileName: 'debug',
  cssFileName: 'debug',
  vite: {
    ...mainConfig.vite,
    build: {
      ...mainConfig.vite.build,
      emptyOutDir: false,
    },
  },
};

const config = process.env.BUILD_ENTRY === 'debug' ? debugConfig : mainConfig;

export default config;
