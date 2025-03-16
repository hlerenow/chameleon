import { BasePage } from '@chamn/demo-page';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import { Engine } from '../../..';
import '../../index.css';
import { DEFAULT_PLUGIN_LIST } from '../../../plugins';
import { InnerComponentMeta } from '../../../material/innerMaterial';
import {} from '@ant-design/icons';

import { DesignerPluginInstance } from '@/plugins/Designer/type';

import { EnginContext } from '@/type';
import renderAsURL from '@chamn/render/dist/index.umd.js?url';

const win = window as any;
win.React = React;
win.ReactDOM = ReactDOM;
win.ReactDOMClient = ReactDOMClient;

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
