import { BasePage, Material } from '@chamn/demo-page';
import { Button, message, Modal } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import { Engine, EnginContext } from '../../..';
import '../../index.css';
import { DEFAULT_PLUGIN_LIST } from '../../../plugins';
import { DesignerExports } from '../../../plugins/Designer';
import { DisplaySourceSchema } from '../../../plugins/DisplaySourceSchema';
import { InnerComponentMeta } from '../../../material/innerMaterial';
import { RollbackOutlined } from '@ant-design/icons';
import { TestComponents } from '@/_dev_/lib';
import { collectVariable, flatObject, LayoutPropsType } from '@chamn/layout';

import renderAsURL from '../../../../node_modules/@chamn/render/dist/index.umd.js?url';

const customRender: LayoutPropsType['customRender'] = async ({
  iframe: iframeContainer,
  assets,
  page,
  pageModel,
  ready,
}) => {
  await iframeContainer.loadUrl('/src/_dev_/render.html');

  const iframeWindow = iframeContainer.getWindow()!;
  const iframeDoc = iframeContainer.getDocument()!;
  const IframeReact = iframeWindow.React!;
  const IframeReactDOM = iframeWindow.ReactDOMClient!;
  const CRender = iframeWindow.CRender!;

  // 从子窗口获取物料对象
  const componentCollection = collectVariable(assets, iframeWindow);
  const components = flatObject(componentCollection);

  const App = IframeReact?.createElement(CRender.DesignRender, {
    adapter: CRender?.ReactAdapter,
    page: page,
    pageModel: pageModel,
    components,
    onMount: (designRenderInstance) => {
      ready(designRenderInstance);
    },
  });

  IframeReactDOM.createRoot(iframeDoc.getElementById('app')!).render(App);
};

const win = window as any;
win.React = React;
win.ReactDOM = ReactDOM;
win.ReactDOMClient = ReactDOMClient;
const buildVersion = `t_${__BUILD_VERSION__}`;

const assetPackagesList = [
  {
    package: 'antd',
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
    // check 本地版本号，如果不一致直接覆盖本地所有的
    const localBuildVersion = localStorage.getItem('build_version');
    if (localBuildVersion !== buildVersion && !import.meta.env.DEV) {
      // 清理 schema, 因为可能 协议不兼容，demo 可以这样粗暴处理
      localStorage.setItem('pageSchema', '');
      localStorage.setItem('build_version', buildVersion);
    }
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
        console.log('to reload');
        designerExports.reload();
      }, 0);
    };

    const workbench = ctx.engine.getWorkbench();

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
        <a target="_blank" href="https://hlerenow.github.io/chameleon/documents/" rel="noreferrer">
          <Button style={{ marginRight: '10px' }}>Documents </Button>
        </a>
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
            let src = '/#/preview';
            if (location.href.includes('hlerenow')) {
              src = '/chameleon/#/preview';
            }

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
              footer: <></>,
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
      components={TestComponents}
      schema={page as any}
      // 传入组件物料
      material={[...InnerComponentMeta, ...Material]}
      // 组件物料对应的 js 运行库，只能使用 umd 模式的 js
      // assetPackagesList={assetPackagesList}
      renderJSUrl={renderAsURL}
      beforePluginRun={({ pluginManager }) => {
        pluginManager.customPlugin('RightPanel', (pluginInstance) => {
          pluginInstance.ctx.config.customPropertySetterMap = {
            TestSetter: (props: any) => {
              useEffect(() => {
                console.log(props);
                const currentNode = props.setterContext.pluginCtx.engine.getActiveNode();
                currentNode.value.configure.isContainer = false;
                currentNode.value.children = [];
                currentNode.updateValue();
                console.log('🚀 ~ file: index.tsx:200 ~ pluginManager.customPlugin ~ currentNode:', currentNode);
              }, []);
              return <div>123</div>;
            },
          };

          return pluginInstance;
        });

        pluginManager.customPlugin('Designer', (pluginInstance) => {
          if (__RUN_MODE__ !== 'APP') {
            pluginInstance.ctx.config.customRender = customRender;
          }
          return pluginInstance;
        });
      }}
      onReady={onReady}
    />
  );
};
