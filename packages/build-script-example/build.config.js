/*eslint no-undef: "error"*/
/*eslint-env node*/

module.exports = {
  entry: './src/main.tsx',
  libName: 'Ddemo',
  external: ['react', 'react-dom'],
  global: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  vite: {},
};
