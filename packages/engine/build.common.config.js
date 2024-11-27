/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';

// const globalCSssVar = fs.readFileSync('./src/assets/styles/mixin.scss', 'utf-8');

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
