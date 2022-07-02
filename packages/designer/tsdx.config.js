const postcss = require('rollup-plugin-postcss');
// Not transpiled with TypeScript or Babel, so use plain Es6/Node.js!
module.exports = {
  // This function will run for each entry/format/env combination
  rollup(config, options) {
    config.plugins.push(
      postcss({
        extract: true,
        modules: true,
        use: [['sass', { data: '@import "src/scss/global-variables.scss";' }]],
        plugins: [],
      })
    );
    return config; // always return a config.
  },
};
