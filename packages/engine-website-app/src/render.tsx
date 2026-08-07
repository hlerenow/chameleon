import renderAsURL from '@chamn/render/dist/index.iife.js?url';
import loadjs from 'loadjs';

loadjs([renderAsURL], () => {
  console.log('load render.umd.js success');
});
