/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';

export default {
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/assets/styles/mixin.scss" as *;\n',
      },
    },
  },
};
