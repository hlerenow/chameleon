import { BasePage, EmptyPage, Material } from '@chameleon/demo-page';
import { CAssetPackage } from '@chameleon/layout/dist/types/common';
import { Button } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import Engine, { EnginContext } from './Engine';
import './index.css';
import { DEFAULT_PLUGIN_LIST } from './plugins';
import { DesignerExports } from './plugins/Designer';

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
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(BasePage);

  useEffect(() => {
    const localPage = localStorage.getItem('pageSchema');
    if (localPage) {
      console.log(
        '🚀 ~ file: main.tsx:48 ~ designer?.ctx.emitter.on ~ localPage',
        localPage,
        JSON.parse(localPage!)
      );
      setPage(JSON.parse(localPage));
    }
    setReady(true);
  }, []);
  const onReady = useCallback((ctx: EnginContext) => {
    const designer = ctx.pluginManager.get('Designer');
    designer?.ctx.emitter.on('ready', (uiInstance) => {
      console.log('out ready', uiInstance);

      const designerExports: DesignerExports = designer.exports;
      designerExports.selectNode('3');
    });

    designer?.ctx.emitter.on('onDrop', (e) => {
      console.log('out onDrop', e);
    });
    const workbench = ctx.engine.getWorkBench();
    workbench?.replaceTopBarView(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '10px',
        }}
      >
        <Button style={{ marginRight: '10px' }}>Preview</Button>
        <Button
          type="primary"
          onClick={() => {
            const newPage = ctx.engine.pageModel.export();
            console.log(
              '🚀 ~ file: main.tsx:68 ~ onReady ~ newPage',
              newPage,
              JSON.stringify(newPage)
            );
            localStorage.setItem('pageSchema', JSON.stringify(newPage));
          }}
        >
          Save
        </Button>
      </div>
    );
  }, []);
  if (!ready) {
    return <>loading...</>;
  }
  return (
    <Engine
      plugins={DEFAULT_PLUGIN_LIST}
      schema={page as any}
      material={Material}
      assets={assets}
      onReady={onReady}
    />
  );
};
ReactDOMClient.createRoot(
  document.getElementById('root') as HTMLElement
).render(<App />);
