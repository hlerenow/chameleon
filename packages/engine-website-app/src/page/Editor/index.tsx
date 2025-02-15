import { BasePage, LayoutPage } from '@chamn/demo-page';
import { Button, Dropdown, message, Modal, Select } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import '../../index.css';
import { ArrowUpOutlined, RollbackOutlined } from '@ant-design/icons';

import commonMeta from '@chamn/material/dist/meta';

import commonComponentUrl from '@chamn/material/dist/index.umd.js?url';
import commonComponentCSS from '@chamn/material/dist/style.css?url';
import {
  DEFAULT_PLUGIN_LIST,
  DesignerSizer,
  DisplaySourceSchema,
  EnginContext,
  Engine,
  InnerComponentMeta,
} from '@chamn/engine';
import '@chamn/engine/dist/style.css';
import { DesignerPluginInstance } from '@chamn/engine/dist/plugins/Designer/type';
import { PluginInstance } from '@chamn/engine/dist/core/pluginManager';

const win = window as any;
win.React = React;
win.ReactDOM = ReactDOM;
win.ReactDOMClient = ReactDOMClient;

const buildVersion = `t_${__BUILD_VERSION__}`;

const demoPageMap = {
  LayoutPage,
  BasePage,
};

const assetPackagesList = [
  {
    package: commonMeta.package,
    globalName: commonMeta.globalName,
    resources: [
      {
        src: commonComponentUrl,
      },
      {
        src: commonComponentCSS,
      },
    ],
  },
];

export const App = () => {
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

    const designer = await ctx.pluginManager.get<DesignerPluginInstance>('Designer');

    const reloadPage = async () => {
      setTimeout(() => {
        const designerExport = designer?.export;
        console.log('to reload');
        designerExport?.reload();
      }, 0);
    };

    const workbench = ctx.engine.getWorkbench();

    // 添加自定义 view, 给组件使用，调用  disposeView 可以移除整个 view
    const disposeView = workbench?.addCustomView({
      key: 'testView',
      view: (
        <div
          style={{
            display: 'none',
          }}
          onClick={() => console.log('click')}
        >
          123123
        </div>
      ),
    });

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

        <Select
          defaultValue={'BasePage'}
          style={{ width: 200, marginRight: '10px' }}
          onChange={(val) => {
            const newPage = (demoPageMap as any)[val];
            if (newPage) {
              setPage(newPage);
              ctx.engine.pageModel.reloadPage(newPage);
            }
          }}
          options={[
            {
              value: 'BasePage',
              label: 'Base Page',
            },
            {
              value: 'LayoutPage',
              label: 'Advance Layout Page',
            },
          ]}
        />
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
        <Select
          defaultValue={lang}
          style={{ width: 100, marginRight: '10px' }}
          onChange={(val) => {
            setLang(val);
            engineRef.current?.engine.getI18n()?.changeLanguage(val);
          }}
          options={[
            {
              value: 'zh_CN',
              label: 'Chinese',
            },
            {
              value: 'en_US',
              label: 'English',
            },
          ]}
        />
        <a target="_blank" href="https://hlerenow.github.io/chameleon/documents/" rel="noreferrer">
          <Button style={{ marginRight: '10px' }}>Documents </Button>
        </a>
        <a target="_blank" href="https://github.com/hlerenow/chameleon" rel="noreferrer">
          <Button style={{ marginRight: '10px' }}>Github </Button>
        </a>

        <Button
          style={{ marginRight: '10px' }}
          onClick={async () => {
            const res = await ctx.pluginManager.get<any>('History');
            res?.export.preStep();
          }}
        >
          <RollbackOutlined />
        </Button>
        <Button
          style={{ marginRight: '10px' }}
          onClick={async () => {
            const res = await ctx.pluginManager.get<any>('History');
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

        <Dropdown.Button
          style={{ marginRight: '10px', width: '110px' }}
          menu={{
            items: [],
          }}
          buttonsRender={() => {
            return [
              <Button
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
                key={1}
              >
                Preview
              </Button>,
              <Button
                key={2}
                style={{
                  padding: '0 8px',
                }}
                onClick={() => {
                  let src = '/#/preview';
                  if (location.href.includes('hlerenow')) {
                    src = '/chameleon/#/preview';
                  }
                  window.open(src);
                }}
              >
                <ArrowUpOutlined
                  style={{
                    fontSize: '12px',
                    transform: 'rotate(30deg)',
                  }}
                />
              </Button>,
            ];
          }}
        >
          Preview
        </Dropdown.Button>

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
      onMount={(ctx) => {
        setTimeout(async () => {
          const res = await ctx.engine.updateMaterials(
            [],
            [
              {
                package: 'lodash',
                globalName: 'lodash',
                resources: [
                  {
                    src: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
                  },
                ],
              },
              {
                package: 'dayjs',
                globalName: 'dayjs',
                resources: [
                  {
                    src: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.12/dayjs.min.js',
                  },
                ],
              },
            ]
          );
          console.log('add material successfully');
        }, 2 * 1000);
      }}
      // 传入组件物料
      material={[...InnerComponentMeta, ...commonMeta.meta]}
      // 组件物料对应的 js 运行库，只能使用 umd 模式的 js
      assetPackagesList={assetPackagesList}
      beforePluginRun={({ pluginManager }) => {
        pluginManager.customPlugin('RightPanel', (pluginInstance: PluginInstance<RightPanelConfig>) => {
          pluginInstance.ctx.config.pluginInstance.ctx.config.customPropertySetterMap = {
            TestSetter: (props: any) => {
              useEffect(() => {
                console.log(props);
                const currentNode = props.setterContext.pluginCtx.engine.getActiveNode();
                currentNode.value.configure.isContainer = false;
                currentNode.value.children = [];
                currentNode.updateValue();
              }, []);
              return <div>123</div>;
            },
          };

          return pluginInstance;
        });

        pluginManager.customPlugin('Designer', (pluginInstance) => {
          return pluginInstance;
        });
      }}
      onReady={onReady}
    />
  );
};
