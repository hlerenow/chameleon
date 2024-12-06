import renderAsURL from '../../node_modules/@chamn/render/dist/index.umd.js?url';
import gridstackURL from '../../node_modules/gridstack/dist/gridstack-all.js?url';
import loadjs from 'loadjs';
import 'gridstack/dist/gridstack.min.css';
import 'gridstack/dist/gridstack-extra.min.css';
import '../components/ReactGridLayout/layout.scss';
import '../components/ReactGridLayout/style.module.scss';

loadjs([renderAsURL, gridstackURL], () => {
  console.log('load render.umd.js success');
});
