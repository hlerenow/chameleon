import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { BasePage } from '@chameleon/demo-page';
import { Layout, LayoutDragAndDropExtraDataType } from '.';
import * as antD from 'antd';
import '@chameleon/material/dist/style.css';
import './dev.css';
import { Sensor, SensorEventObjType } from './core/dragAndDrop/sensor';
import { CNode, parsePageModel } from '@chameleon/model';

(window as any).React = React;
(window as any).ReactDOM = ReactDOMAll;
(window as any).ReactDOMClient = ReactDOM;

const components = {
  ...antD,
};

const App = () => {
  const [page] = useState<any>(BasePage);

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
          id: '111',
          componentName: 'Button',
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
        debugger;
        const pageModel = layoutRef.current?.getPageModel();
        console.log('box drop', eventObj, pageModel);
        const extraData = eventObj.extraData as LayoutDragAndDropExtraDataType;
        if (extraData.type === 'NEW_ADD') {
          pageModel?.addNode(
            extraData.startNode as CNode,
            extraData.dropNode!,
            'BEFORE'
          );
        } else {
          if (extraData.dropNode?.id === extraData.startNode?.id) {
            return;
          }
          if (extraData.dropPosInfo?.pos === 'before') {
            pageModel?.moveNodeById(
              extraData.startNode?.id || '',
              extraData?.dropNode?.id || '',
              'BEFORE'
            );
          } else {
            pageModel?.moveNodeById(
              extraData.startNode?.id || '',
              extraData?.dropNode?.id || '',
              'AFTER'
            );
          }
        }
        console.log(
          '选中元素',
          extraData.startNode?.id || '',
          extraData?.dropNode?.id
        );
        layoutRef.current?.selectNode(extraData.startNode?.id || '');

        console.log(pageModel?.export());
      });
    });
    const pageModel = layoutRef.current?.getPageModel();

    console.log(11111, pageModel?.export());
  }, []);
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '50px',
        display: 'flex',
      }}
    >
      <div
        ref={leftBoxRef}
        style={{ border: '1px solid red', width: '300px' }}
        onClick={() => {
          layoutRef.current?.selectNode('32');
        }}
      >
        left
      </div>
      <div
        style={{
          width: '800px',
          height: '100%',
          margin: '0 auto',
          overflow: 'hidden',
          padding: '10px',
        }}
      >
        <Layout
          ref={layoutRef}
          page={page}
          components={components}
          assets={[
            {
              name: 'antd',
              assets: [
                {
                  src: 'https://cdn.jsdelivr.net/npm/antd@5.0.1/dist/reset.css',
                },
                {
                  src: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.6/dayjs.min.js',
                },
                {
                  src: 'https://cdn.jsdelivr.net/npm/antd@5.0.1/dist/antd.min.js',
                },
              ],
            },
          ]}
        />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
