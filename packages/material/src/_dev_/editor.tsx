import { Button, message, Modal } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import '@chamn/engine/dist/style.css';
import customMaterial from '../meta';
import {
  Engine,
  DesignerSizer,
  EnginContext,
  InnerComponentMeta,
  plugins,
  LayoutPropsType,
} from '@chamn/engine';
import { RollbackOutlined } from '@ant-design/icons';
import { EmptyPage } from '@chamn/model';
import pkg from '../../package.json';
import { DesignerPluginInstance } from '@chamn/engine/dist/plugins/Designer/type';
import { collectVariable, flatObject, getThirdLibs } from '@chamn/render';
import renderAsURL from '../../node_modules/@chamn/render/dist/index.umd.js?url';
import { loader } from '@monaco-editor/react';
import * as componentLibs from '../components/index';

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.37.1/min/vs',
  },
});
loader.init();

const { DisplaySourceSchema, DEFAULT_PLUGIN_LIST } = plugins;

const customRender: LayoutPropsType['customRender'] = async ({
  iframe: iframeContainer,
  assets,
  page,
  pageModel,
  beforeInitRender,
  ready,
}) => {
  await iframeContainer.loadUrl('/src/_dev_/render.html');
  beforeInitRender?.();
  const iframeWindow = iframeContainer.getWindow()!;
  const iframeDoc = iframeContainer.getDocument()!;
  (iframeWindow as any).ChamnCustomComponent = componentLibs;

  const IframeReact = iframeWindow.React!;
  const IframeReactDOM = iframeWindow.ReactDOMClient!;
  const CRender = iframeWindow.CRender!;

  console.log(
    '[parent View] load render.umd.js is success',
    iframeWindow.CRender
  );

  // 从子窗口获取物料对象
  const componentCollection = collectVariable(assets, iframeWindow);
  const components = flatObject(componentCollection);
  const thirdLibs = getThirdLibs(componentCollection, page?.thirdLibs || []);

  const App = IframeReact?.createElement(CRender.DesignRender, {
    adapter: CRender?.ReactAdapter,
    page: page,
    pageModel: pageModel,
    components,
    $$context: {
      thirdLibs,
    },
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

const assetPackagesList = [
  {
    package: pkg.name,
    globalName: 'ChamnCustomComponent',
    resources: [],
  },
];

export const Editor = () => {
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(EmptyPage);

  useEffect(() => {
    // 从本地获取 page schema
    const localPage = localStorage.getItem('pageSchema');
    if (localPage) {
      setPage(JSON.parse(localPage));
    }
    setReady(true);
  }, []);

  const onReady = useCallback(async (ctx: EnginContext) => {
    const designer = await ctx.pluginManager.get<DesignerPluginInstance>(
      'Designer'
    );
    const reloadPage = async () => {
      setTimeout(() => {
        const designerExports = designer?.export;
        designerExports?.reload();
      }, 0);
    };

    // 获取 引擎 工作台对象
    const workbench = ctx.engine.getWorkbench();
    workbench?.openLeftPanel('ComponentLib');
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
        <div
          style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '10px',
          }}
        >
          {ctx && <DesignerSizer ctx={ctx} />}
        </div>
        <a
          target="_blank"
          href="https://github.com/hlerenow/chameleon"
          rel="noreferrer"
        >
          <Button style={{ marginRight: '10px' }}>Github </Button>
        </a>

        <Button
          style={{ marginRight: '10px' }}
          onClick={async () => {
            const res = await ctx.pluginManager.get('History');
            res?.export.preStep();
          }}
        >
          <RollbackOutlined />
        </Button>
        <Button
          style={{ marginRight: '10px' }}
          onClick={async () => {
            const res = await ctx.pluginManager.get('History');
            res?.export.nextStep();
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
      assetPackagesList={assetPackagesList}
      // 传入组件物料, 这里使用内置的基础物料以及 测试物料信
      material={[...InnerComponentMeta, ...customMaterial.meta]}
      // 传入组件物料对应的 js 运行库，只能使用 umd 模式的 js
      onReady={onReady}
      beforePluginRun={({ pluginManager }) => {
        pluginManager.customPlugin('Designer', (pluginInstance) => {
          pluginInstance.ctx.config.customRender = customRender;
          return pluginInstance;
        });
      }}
      renderJSUrl={renderAsURL}
    />
  );
};
