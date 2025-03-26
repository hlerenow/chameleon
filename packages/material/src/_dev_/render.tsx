import renderAsURL from '../../node_modules/@chamn/render/dist/index.umd.js?url';
import gridstackURL from '../../node_modules/gridstack/dist/gridstack-all.js?url';
import loadjs from 'loadjs';
import * as componentLibs from '../components/index';

(window as any).ChamnCustomComponent = componentLibs;

loadjs([renderAsURL, gridstackURL], () => {
  console.log('load render.umd.js success');
});
