import renderAsURL from '../../node_modules/@chamn/render/dist/index.umd.js?url';
import loadjs from 'loadjs';

loadjs([renderAsURL], () => {
  console.log('load render.umd.js success');
});
