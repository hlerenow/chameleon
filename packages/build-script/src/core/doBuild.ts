import { build } from 'vite';
import { buildConfig } from '../config/vite.build';

export const doBuild = async () => {
  console.log('start to build .....');
  await build(await buildConfig());
  console.log('build finished.');
};
