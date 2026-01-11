import pgk from './package.json';
import pluginExternal from 'vite-plugin-external';

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
    plugins: [
      pluginExternal({
        externals: {
          react: 'React',
          'react-dom/client': 'ReactDOM',
        },
      }),
    ],
  },
};

if (LIB_NAME) {
  const libConfig = {
    entry: './src/index.tsx',
    libName: GLOBAL_LIB_NAME,
    // formats 会根据构建模式自动设置：生产模式包含 umd，开发模式只有 cjs 和 es
    global: {
      react: 'React',
      'react-dom/client': 'ReactDOM',
      'react-dom': 'ReactDOM',
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
