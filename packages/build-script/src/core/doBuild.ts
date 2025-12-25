import { build } from 'vite';
import { buildConfig } from '../config/vite.build';
import { getCustomConfig, CLI_ARGS_OBJ } from '../config/base';
import type { LibraryFormats } from 'vite';

export const doBuild = async () => {
  console.log('start to build .....');

  const CUSTOM_CONFIG = await getCustomConfig();
  const defaultFormats: LibraryFormats[] = CLI_ARGS_OBJ.build ? ['cjs', 'es', 'umd'] : ['cjs', 'es'];
  const formats = CUSTOM_CONFIG?.formats || defaultFormats;

  // 将格式分为两组：
  // 1. 模块格式组（es, cjs）- 通常使用更严格的 external
  // 2. 浏览器格式组（umd, iife）- 通常只 external react, react-dom
  const moduleFormats = formats.filter((f) => f === 'es' || f === 'cjs') as LibraryFormats[];
  const browserFormats = formats.filter((f) => f === 'umd' || f === 'iife') as LibraryFormats[];

  const hasModuleFormats = moduleFormats.length > 0;
  const hasBrowserFormats = browserFormats.length > 0;

  // 如果两组都存在，分两次构建
  if (hasModuleFormats && hasBrowserFormats) {
    // 先构建模块格式（es, cjs）
    console.log(`Building module formats: ${moduleFormats.join(', ')}...`);
    await build(await buildConfig(moduleFormats));

    // 再构建浏览器格式（umd, iife），不清空输出目录
    console.log(`Building browser formats: ${browserFormats.join(', ')}...`);
    await build(await buildConfig(browserFormats, true));
  } else {
    // 如果只有一组格式，正常构建
    await build(await buildConfig());
  }

  console.log('build finished.');
};
