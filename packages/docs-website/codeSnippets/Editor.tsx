import { BasePage, Material } from '@chamn/demo-page';
import { Button, message, Modal } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import '@chamn/engine/dist/style.css';
import { Engine, EnginContext, InnerComponentMeta, plugins } from '@chamn/engine';
import { RollbackOutlined } from '@ant-design/icons';
import { DesignerExports } from '@chamn/engine/dist/plugins/Designer';
import './index.css';

const { DisplaySourceSchema, DEFAULT_PLUGIN_LIST } = plugins;

const win = window as any;
win.React = React;
win.ReactDOM = ReactDOM;
win.ReactDOMClient = ReactDOMClient;

// 你可以使用自定的物料组件库
const assetPackagesList = [
  {
    package: '@chamn/mock-material',
    globalName: 'antd',
    resources: [
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
    // 从本地获取 page schema
    const localPage = localStorage.getItem('pageSchema');
    if (localPage) {
      setPage(JSON.parse(localPage));
    }
    setReady(true);
  }, []);

  const onReady = useCallback(async (ctx: EnginContext) => {
    const designer = await ctx.pluginManager.onPluginReadyOk('Designer');
    const reloadPage = async () => {
      setTimeout(() => {
        const designerExports = designer?.exports as DesignerExports;
        designerExports.reload();
      }, 0);
    };

    // 获取 引擎 工作台对象
    const workbench = ctx.engine.getWorkbench();

    // 自定义顶部 bar
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
        <div className="logo">Chameleon EG</div>

        <a target="_blank" href="https://github.com/hlerenow/chameleon" rel="noreferrer">
          <Button style={{ marginRight: '10px' }}>Github </Button>
        </a>

        <Button
          style={{ marginRight: '10px' }}
          onClick={async () => {
            const res = await ctx.pluginManager.get('History');
            res?.exports.preStep();
          }}
        >
          <RollbackOutlined />
        </Button>
        <Button
          style={{ marginRight: '10px' }}
          onClick={async () => {
            const res = await ctx.pluginManager.get('History');
            res?.exports.nextStep();
          }}
        >
          <RollbackOutlined
            style={{
              transform: 'rotateY(180deg)',
            }}
          />
        </Button>

        <DisplaySourceSchema pageModel={ctx.engine.pageModel} engineCtx={ctx}>
          <Button style={{ marginRight: '10px' }}>Source Code</Button>
        </DisplaySourceSchema>

        <Button
          style={{ marginRight: '10px' }}
          onClick={() => {
            reloadPage();
          }}
        >
          Refresh Page
        </Button>
        <Button
          style={{ marginRight: '10px' }}
          onClick={() => {
            const src = '/#/preview';

            Modal.info({
              closable: true,
              icon: null,
              width: 'calc(100vw - 100px)',
              centered: true,
              title: (
                <div>
                  Preview
                  <Button
                    size="small"
                    style={{
                      float: 'right',
                      marginRight: '30px',
                    }}
                    onClick={() => {
                      window.open(src);
                    }}
                  >
                    Open in new window
                  </Button>
                </div>
              ),
              content: (
                <div
                  style={{
                    width: '100%',
                    height: 'calc(100vh - 200px)',
                  }}
                >
                  <iframe
                    style={{
                      border: '1px solid #e7e7e7',
                      width: '100%',
                      height: '100%',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}
                    src={src}
                  />
                </div>
              ),
              footer: null,
            });
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
  }, []);

  if (!ready) {
    return <>loading...</>;
  }

  return (
    <Engine
      plugins={DEFAULT_PLUGIN_LIST}
      schema={page}
      // 传入组件物料, 这里使用内置的基础物料以及 测试物料信
      material={[...InnerComponentMeta, ...Material]}
      onReady={onReady}
    />
  );
};
