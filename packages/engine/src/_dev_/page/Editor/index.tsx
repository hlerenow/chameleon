import { BasePage, EmptyPage, Material } from '@chameleon/demo-page';
import { CAssetPackage } from '@chameleon/layout/dist/types/common';
import { Button, message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import Engine, { EnginContext } from '../../../Engine';
import '../../index.css';
import { DEFAULT_PLUGIN_LIST } from '../../../plugins';
import { DesignerExports } from '../../../plugins/Designer';
import { DisplaySourceSchema } from '../../../plugins/DisplaySourceSchema';

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

export const App = () => {
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(BasePage);

  useEffect(() => {
    const localPage = localStorage.getItem('pageSchema');
    if (localPage) {
      setPage(JSON.parse(localPage));
    }
    setReady(true);
  }, []);
  const onReady = useCallback((ctx: EnginContext) => {
    const designer = ctx.pluginManager.get('Designer');
    designer?.ctx.emitter.on('ready', (uiInstance) => {
      // console.log('out ready', uiInstance);
      const designerExports: DesignerExports = designer.exports;
      designerExports.selectNode('3');
    });

    // designer?.ctx.emitter.on('onDrop', (e) => {
    //   console.log('out onDrop', e);
    // });
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
        <a
          target="_blank"
          href="https://github.com/hlerenow/chameleon"
          rel="noreferrer"
        >
          <Button style={{ marginRight: '10px' }}>Github </Button>
        </a>

        <DisplaySourceSchema pageModel={ctx.engine.pageModel}>
          <Button style={{ marginRight: '10px' }}>Source Code</Button>
        </DisplaySourceSchema>
        <Button
          style={{ marginRight: '10px' }}
          onClick={() => {
            if (location.href.includes('hlerenow')) {
              window.open('/chameleon/#/preview');
            } else {
              window.open('/#/preview');
            }
          }}
        >
          Preview
        </Button>
        <Button
          type="primary"
          onClick={() => {
            const newPage = ctx.engine.pageModel.export();
            localStorage.setItem('pageSchema', JSON.stringify(newPage));
            message.success('Save successfully');
          }}
        >
          Save
        </Button>
      </div>
    );

    workbench?.openLeftPanel('OutlineTree');
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
