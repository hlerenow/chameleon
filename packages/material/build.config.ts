import pgk from './package.json';
const GLOBAL_LIB_NAME = 'ChamnCommonComponents';

const envDefine = {
  __PACKAGE_VERSION__: JSON.stringify(pgk.version),
  __PACKAGE_NAME__: JSON.stringify(pgk.name),
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  __GLOBAL_LIB_NAME__: JSON.stringify(GLOBAL_LIB_NAME),
};
// 开发模式默认读取 index.html 作为开发模式入口
// entry 作为打包库入口
const LIB_NAME = process.env.LIB_NAME;
let buildConfig: any = {
  entry: './src/index.tsx',
  vite: {
    define: envDefine,
    plugins: [],
  },
};

if (LIB_NAME) {
  const libConfig = {
    entry: './src/index.tsx',
    libName: GLOBAL_LIB_NAME,
    formats: process.env.DEV ? ['umd'] : ['es', 'cjs', 'umd'],
    fileName: 'index',
    external: ['react'],
    global: {
      react: 'React',
    },
    // 额外的 vite 配置
    vite: {
      define: envDefine,
    },
  };

  const metaConfig = {
    entry: './src/meta.tsx',
    libName: `${GLOBAL_LIB_NAME}Meta`,
    formats: ['es', 'cjs'],
    fileName: 'meta',
    external: ['react'],
    global: {
      react: 'React',
    },
    // 额外的 vite 配置
    vite: {
      build: {
        emptyOutDir: false,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css' && LIB_NAME !== 'index')
            return `${LIB_NAME}.css`;
          return assetInfo.name;
        },
        lib: {
          fileName: (format) => {
            if (format === 'es') {
              return 'meta.js';
            } else {
              return `meta.${format}.js`;
            }
          },
        },
      },
      define: envDefine,
    },
  };

  buildConfig = libConfig;
  if (process.env.LIB_NAME === 'meta') {
    buildConfig = metaConfig;
  }
}

export default buildConfig;
