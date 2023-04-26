import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { BasePage, Material } from '@chamn/demo-page';
import { Layout, LayoutDragAndDropExtraDataType, LayoutPropsType } from '.';
import * as antD from 'antd';
import './dev.css';
import { Sensor, SensorEventObjType } from './core/dragAndDrop/sensor';
import { AssetPackage, CNode, CPage } from '@chamn/model';
import { collectVariable, flatObject } from './utils';

(window as any).React = React;
(window as any).ReactDOM = ReactDOMAll;
(window as any).ReactDOMClient = ReactDOM;

const assets: AssetPackage[] = [
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

const components = {
  ...antD,
};

const beforeInitRender: LayoutPropsType['beforeInitRender'] = async ({ iframe }) => {
  const subWin = iframe.getWindow();
  if (!subWin) {
    return;
  }
  subWin.React = React;
  (subWin as any).ReactDOM = ReactDOMAll;
  (subWin as any).ReactDOMClient = ReactDOM;
  //   iframe.injectJsText(`
  //   window.React = window.parent.React;
  //   window.ReactDOM = window.parent.ReactDOM;
  //   window.ReactDOMClient = window.parent.ReactDOMClient;
  // `);
};

const customRender: LayoutPropsType['customRender'] = async ({
  iframe: iframeContainer,
  assets,
  page,
  pageModel,
  ready,
}) => {
  await iframeContainer.injectJS('./render.umd.js');
  const iframeWindow = iframeContainer.getWindow()!;
  const iframeDoc = iframeContainer.getDocument()!;
  const IframeReact = iframeWindow.React!;
  const IframeReactDOM = iframeWindow.ReactDOMClient!;
  const CRender = iframeWindow.CRender!;
  // 注入组件物料资源
  const assetLoader = new CRender.AssetLoader(assets);
  assetLoader
    .onSuccess(() => {
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
    })
    .onError(() => {
      console.log('资源加载出粗');
    })
    .load();
};

const App = () => {
  const [page] = useState<any>(BasePage);
  const [ghostView, setGhostView] = useState(<div>213</div>);
  const [pageModel] = useState<any>(
    new CPage(BasePage, {
      materials: [
        ...Material,
        {
          title: '块',
          componentName: 'CText',
          isSupportDispatchNativeEvent: true,
          snippets: [],
        } as any,
        {
          title: '块',
          componentName: 'CBlock',
          isSupportDispatchNativeEvent: true,
          snippets: [],
        } as any,
        {
          title: '块',
          componentName: 'Button',
          isSupportDispatchNativeEvent: true,
          snippets: [],
        } as any,
      ],
    })
  );
  console.log('Material', Material);

  const leftBoxRef = useRef<HTMLDivElement>(null);
  const layoutRef = useRef<Layout>(null);
  useEffect(() => {
    layoutRef.current?.ready(() => {
      console.log('layoutRef', layoutRef);
      const boxSensor = new Sensor({
        name: 'widgetListBox',
        container: leftBoxRef.current!,
      });
      boxSensor.setCanDrag((eventObj: SensorEventObjType) => {
        const pageModel = layoutRef.current?.getPageModel();

        const newNode = pageModel?.createNode({
          id: '11xzxczxczxc1',
          componentName: 'Button',
          props: {
            onClick: {
              type: 'FUNCTION',
              value: `function click(e) {
                console.log(112312312311, e);
              }`,
            },
          },
          children: ['insertData'],
        });
        return {
          ...eventObj,
          extraData: {
            type: 'NEW_ADD',
            startNode: newNode,
          } as LayoutDragAndDropExtraDataType,
        };
      });

      layoutRef.current?.dnd.registerSensor(boxSensor);

      boxSensor.setCanDrop((eventObj) => {
        const newNode = new CNode({
          id: 'newAdd',
          componentName: 'Button',
          children: ['new add'],
        });
        return {
          ...eventObj,
          extraData: {
            dropPosInfo: {
              // pos: 'before',
            },
            dropNode: newNode,
          } as LayoutDragAndDropExtraDataType,
        };
      });

      boxSensor.emitter.on('dragStart', (eventObj) => {
        setGhostView(<div>{eventObj.extraData?.startNode.value.componentName}</div>);
        if (eventObj.currentSensor === boxSensor) {
          layoutRef.current?.clearSelectNode();
        }
      });
      boxSensor.emitter.on('dragging', (eventObj) => {
        // console.log('box dragging', eventObj);
      });
      boxSensor.emitter.on('dragEnd', (eventObj) => {
        // console.log('box dragEnd', eventObj);
      });
      boxSensor.emitter.on('drop', (eventObj) => {
        const pageModel = layoutRef.current?.getPageModel();
        const extraData = eventObj.extraData as LayoutDragAndDropExtraDataType;
        if (!extraData.dropNode) {
          console.warn('cancel drop, because drop node is null');
          return;
        }
        if (extraData.type === 'NEW_ADD') {
          pageModel?.addNode(extraData.startNode as CNode, extraData.dropNode, 'BEFORE');
        } else {
          if (extraData.dropNode?.id === extraData.startNode?.id) {
            return;
          }
          if (extraData.dropPosInfo?.pos === 'before') {
            pageModel?.moveNodeById(extraData.startNode?.id || '', extraData?.dropNode?.id || '', 'BEFORE');
          } else {
            pageModel?.moveNodeById(extraData.startNode?.id || '', extraData?.dropNode?.id || '', 'AFTER');
          }
        }
        console.log('选中元素', extraData.startNode?.id || '', extraData?.dropNode?.id, extraData);
        layoutRef.current?.selectNode(extraData.startNode?.id || '');

        console.log(pageModel?.export());
      });
      const pageModel = layoutRef.current?.getPageModel();
      console.log('pageModel?.export()', pageModel?.export());
    });
  }, []);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '20px',
        display: 'flex',
      }}
    >
      <div
        ref={leftBoxRef}
        style={{ border: '1px solid rgba(0,0,0, 0.3)', padding: '10px', borderRadius: '2px', width: '300px' }}
        onClick={() => {
          layoutRef.current?.selectNode('32');
        }}
      >
        Tool Box
      </div>
      <div
        style={{
          width: '100%',
          height: '100%',
          margin: '0 auto',
          overflow: 'hidden',
        }}
      >
        <Layout
          ref={layoutRef}
          // page={page}
          pageModel={pageModel}
          components={components}
          // selectToolBar={<div>123</div>}
          assets={assets}
          ghostView={ghostView}
          beforeInitRender={beforeInitRender}
          customRender={customRender}
        />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
