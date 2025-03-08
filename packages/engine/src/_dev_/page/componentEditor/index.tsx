import { BasePage } from '@chamn/demo-page';
import { Button, message, Modal, Select } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import { Engine } from '../../..';
import '../../index.css';
import { DEFAULT_PLUGIN_LIST } from '../../../plugins';
import { DisplaySourceSchema } from '../../../plugins/DisplaySourceSchema';
import { InnerComponentMeta } from '../../../material/innerMaterial';
import { RollbackOutlined } from '@ant-design/icons';
import { LayoutMode, LayoutPropsType } from '@chamn/layout';

import { collectVariable, flatObject, getThirdLibs } from '@chamn/render';
import { HistoryPluginInstance } from '@/plugins/History/type';
import { DesignerPluginInstance } from '@/plugins/Designer/type';

import { DesignerSizer } from '@/component/DesignerSizer';
import { EnginContext } from '@/type';
import renderAsURL from '@chamn/render/dist/index.umd.js?url';
import staticMethods from 'antd/es/message';

const win = window as any;
win.React = React;
win.ReactDOM = ReactDOM;
win.ReactDOMClient = ReactDOMClient;

const customRender: LayoutPropsType['customRender'] = async ({
  iframe: iframeContainer,
  assets,
  page,
  pageModel,
  beforeInitRender,
  ready,
}) => {
  await iframeContainer.loadUrl('/src/_dev_/render.html');
  // must call
  beforeInitRender?.();
  const iframeWindow = iframeContainer.getWindow()!;
  const iframeDoc = iframeContainer.getDocument()!;
  const IframeReact = iframeWindow.React!;
  const IframeReactDOM = iframeWindow.ReactDOMClient!;
  const CRender = iframeWindow.CRender!;
  await new CRender.AssetLoader(assets, {
    window: iframeWindow,
  }).load();
  // 从子窗口获取物料对象
  const componentCollection = collectVariable(assets, iframeWindow);
  const components = flatObject(componentCollection);
  const thirdLibs = getThirdLibs(componentCollection, page?.thirdLibs || []);
  const App = IframeReact?.createElement(CRender.DesignRender, {
    adapter: CRender?.ReactAdapter,
    page: page,
    pageModel: pageModel,
    components: {
      ...components,
    },
    $$context: {
      thirdLibs,
    },
    requestAPI: async (params) => {
      return console.log(222, params);
    },
    onMount: (designRenderInstance) => {
      ready(designRenderInstance);
    },
  });

  IframeReactDOM.createRoot(iframeDoc.getElementById('app')!).render(App);
};

const buildVersion = `t_${__BUILD_VERSION__}`;

const assetPackagesList = [] as any[];
export const ComponentEditor = () => {
  const [ready, setReady] = useState(false);
  const [page, setPage] = useState(BasePage);
  const [lang, setLang] = useState(() => {
    const lang = localStorage.getItem('lang') || 'zh_CN';
    return lang;
  });

  const engineRef = useRef<EnginContext>();

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
    engineRef.current = ctx;
    engineRef.current?.engine.getI18n()?.changeLanguage(lang);

    const designer: DesignerPluginInstance = await ctx.pluginManager.onPluginReadyOk('Designer');
    // designer.export?.setMode?.(LayoutMode.EDIT);

    // setTimeout(() => {
    //   designer.export?.setMode?.(LayoutMode.PREVIEW);
    //   setTimeout(() => {
    //     designer.export?.setMode?.(LayoutMode.EDIT);
    //   }, 3 * 1000);
    // }, 5 * 1000);

    engineRef.current?.engine.preview();

    setTimeout(() => {
      engineRef.current?.engine.existPreview();
      setTimeout(() => {
        engineRef.current?.engine.preview();
      }, 5000);
    }, 3000);

    const workbench = ctx.engine.getWorkbench();

    workbench?.replaceTopBarView(<></>);
  }, []);

  if (!ready) {
    return <>loading...</>;
  }

  return (
    <Engine
      workbenchConfig={{
        hiddenTopBar: true,
        hiddenLeftPanel: true,
      }}
      plugins={DEFAULT_PLUGIN_LIST}
      schema={page}
      // 传入组件物料
      material={[...InnerComponentMeta]}
      // 组件物料对应的 js 运行库，只能使用 umd 模式的 js
      assetPackagesList={assetPackagesList}
      beforePluginRun={({ pluginManager }) => {
        pluginManager.customPlugin('Designer', (pluginInstance: DesignerPluginInstance) => {
          pluginInstance.ctx.config.toolbarViewRender = () => {
            return <></>;
          };
          return pluginInstance;
        });
      }}
      renderJSUrl={renderAsURL}
      onReady={onReady}
      renderProps={{
        requestAPI: async (params) => {
          return console.log(7788, params);
        },
      }}
    />
  );
};
