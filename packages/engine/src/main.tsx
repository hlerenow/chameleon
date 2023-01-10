import { BasePage, EmptyPage, Material } from '@chameleon/demo-page';
import { CAssetPackage } from '@chameleon/layout/dist/types/common';
import React, { useCallback } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import Engine, { EnginContext } from './Engine';
import './index.css';
import { DEFAULT_PLUGIN_LIST } from './plugins';

(window as any).React = React;
(window as any).ReactDOM = ReactDOM;
(window as any).ReactDOMClient = ReactDOMClient;

// {
//   src: 'https://cdn.jsdelivr.net/npm/antd@5.0.1/dist/reset.css',
// },
// {
//   src: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.6/dayjs.min.js',
// },
// {
//   src: 'https://cdn.jsdelivr.net/npm/antd@5.0.1/dist/antd.min.js',
// },
const assets: CAssetPackage[] = [
  {
    name: 'antd',
    resourceType: 'Component',
    assets: [
      {
        src: 'https://cdn.bootcdn.net/ajax/libs/antd/5.1.2/reset.css',
      },
      {
        src: 'https://cdn.bootcdn.net/ajax/libs/dayjs/1.11.7/dayjs.min.js',
      },
      {
        src: 'https://cdn.bootcdn.net/ajax/libs/antd/5.1.2/antd.js',
      },
    ],
  },
];

const App = () => {
  const onReady = useCallback((ctx: EnginContext) => {
    const designer = ctx.pluginManager.get('Designer');
    designer?.ctx.emitter.on('ready', (uiInstance) => {
      console.log('out ready', uiInstance);
      designer?.exports.selectNode('3');
    });

    designer?.ctx.emitter.on('onDrop', (e) => {
      console.log('out onDrop', e);
    });
  }, []);
  return (
    <Engine
      plugins={DEFAULT_PLUGIN_LIST}
      schema={EmptyPage as any}
      material={Material}
      assets={assets}
      onReady={onReady}
    />
  );
};
ReactDOMClient.createRoot(
  document.getElementById('root') as HTMLElement
).render(<App />);
