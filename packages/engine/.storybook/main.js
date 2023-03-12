const { mergeConfig } = require('vite');
const viteConfig = require('../build.config').vite;
console.log('🚀 ~ file: main.js:2 ~ viteConfig:', viteConfig.resolve);
module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-vite',
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      // Use the same "resolve" configuration as your app
      resolve: viteConfig.resolve,
      css: viteConfig.css,
      // Add dependencies to pre-optimization
      optimizeDeps: {
        include: ['storybook-dark-mode'],
      },
      define: {
        global: 'window',
      },
    });
  },
};
