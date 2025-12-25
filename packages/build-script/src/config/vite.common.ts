import path from 'path';
import react from '@vitejs/plugin-react';
import { CLI_ARGS_OBJ, PROJECT_ROOT, getCustomConfig } from './base';
import { defineConfig, type LibraryFormats } from 'vite';
import eslint from 'vite-plugin-eslint2';

// https://vitejs.dev/config/
export const getCommonConfig = async (specifiedFormats?: LibraryFormats[]) => {
  const CUSTOM_CONFIG = await getCustomConfig();

  if (!CUSTOM_CONFIG?.entry) {
    throw new Error('entry not find');
  }
  // 生产模式下默认包含 umd，否则只有 cjs 和 es
  const defaultFormats: LibraryFormats[] = CLI_ARGS_OBJ.build ? ['cjs', 'es', 'umd'] : ['cjs', 'es'];
  const formats = specifiedFormats || CUSTOM_CONFIG.formats || defaultFormats;

  // 根据当前构建的格式来决定 external 的逻辑
  const getExternal = () => {
    // 开发模式下不使用 external，打包所有依赖
    if (CLI_ARGS_OBJ.dev || !CLI_ARGS_OBJ.build) {
      return [];
    }

    // 优先使用按格式配置的 external
    if (CUSTOM_CONFIG.externalByFormat) {
      // 如果是单个格式，直接使用对应的配置
      if (formats.length === 1) {
        const format = formats[0] as keyof typeof CUSTOM_CONFIG.externalByFormat;
        const externalForFormat = CUSTOM_CONFIG.externalByFormat[format];
        if (externalForFormat !== undefined) {
          return externalForFormat;
        }
      }

      // 如果是多个格式，检查是否都是同一组
      const isAllModuleFormats = formats.every((f) => f === 'es' || f === 'cjs');
      const isAllBrowserFormats = formats.every((f) => f === 'umd' || f === 'iife');

      if (isAllModuleFormats) {
        // 如果都是模块格式，优先使用 es 的配置，然后是 cjs
        const moduleExternal = CUSTOM_CONFIG.externalByFormat.es || CUSTOM_CONFIG.externalByFormat.cjs;
        if (moduleExternal) {
          return moduleExternal;
        }
      }

      if (isAllBrowserFormats) {
        // 如果都是浏览器格式，优先使用 umd 的配置，然后是 iife
        const browserExternal = CUSTOM_CONFIG.externalByFormat.umd || CUSTOM_CONFIG.externalByFormat.iife;
        if (browserExternal) {
          return browserExternal;
        }
      }
    }

    // 如果用户自定义了通用的 external，使用自定义配置
    if (CUSTOM_CONFIG.external) {
      return CUSTOM_CONFIG.external;
    }

    // 默认规则：判断当前格式组
    const isAllBrowserFormats = formats.every((f) => f === 'umd' || f === 'iife');

    if (isAllBrowserFormats) {
      // 浏览器格式（umd, iife）：只过滤 react 和 react-dom
      return ['react', 'react-dom'];
    }

    // 模块格式（es, cjs）或混合格式：使用更严格的过滤规则
    // 排除项目内部文件：相对路径、绝对路径、别名路径
    return (id: string) => {
      // 相对路径或绝对路径：项目内部文件
      if (id.startsWith('.') || id.startsWith('/')) {
        return false;
      }
      // 检查别名路径：使用用户配置的 externalAlias 或默认值
      const aliasPrefixes = CUSTOM_CONFIG.externalAlias || ['@/', '~/', '#/'];
      if (aliasPrefixes.some((prefix) => id.startsWith(prefix))) {
        return false; // 不外部化，需要打包
      }
      // 其他情况：node_modules 中的依赖，应该外部化
      return true;
    };
  };

  const commonConfigJson = defineConfig({
    root: PROJECT_ROOT,
    build: {
      sourcemap: CLI_ARGS_OBJ.sourcemap ?? true,
      lib: {
        name: CUSTOM_CONFIG.libName,
        entry: path.resolve(PROJECT_ROOT, CUSTOM_CONFIG.entry),
        formats: formats,
        fileName: (format: string) => `${CUSTOM_CONFIG.fileName || 'index'}.${format}.js`,
        cssFileName: CUSTOM_CONFIG.cssFileName ?? 'style',
      },
      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: getExternal(),
        output: {
          // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
          globals: CUSTOM_CONFIG.global || {},
        },
      },
    },
    plugins: [react(), eslint()],
  });

  if (CUSTOM_CONFIG.libMode === false) {
    delete commonConfigJson?.build?.lib;
    delete commonConfigJson?.build?.rollupOptions;
  }

  return commonConfigJson;
};
