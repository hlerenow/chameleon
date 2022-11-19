import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { BasePage } from '@chameleon/demo-page';
import { Layout, LayoutDragAndDropExtraDataType } from './Layout';
import * as antD from 'antd';
import '@chameleon/material/dist/style.css';
import './index.css';
import { Sensor, SensorEventObjType } from './core/dragAndDrop/sensor';

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
        return {
          ...eventObj,
          extraData: {
            startNode: {
              id: '111',
              componentName: 'Button',
              children: ['insertData'],
            },
          },
        };
      });

      layoutRef.current?.dnd.registerSensor(boxSensor);

      boxSensor.setCanDrop((eventObj) => {
        const dropInstance = (
          layoutRef.current?.designRenderRef.current?.getInstancesById(
            'div1'
          ) || []
        ).shift();

        console.log(
          dropInstance,
          dropInstance?._NODE_ID,
          dropInstance?._UNIQUE_ID
        );
        return {
          ...eventObj,
          extraData: {
            dropInfo: {
              pos: 'before',
            },
            dropNode: dropInstance?._NODE_MODEL,
            dropNodeUid: dropInstance?._UNIQUE_ID,
          } as LayoutDragAndDropExtraDataType,
        };
      });

      boxSensor.emitter.on('dragStart', (eventObj) => {
        // console.log('box drag start', eventObj);
      });
      boxSensor.emitter.on('dragging', (eventObj) => {
        // console.log('box dragging', eventObj);
      });
      boxSensor.emitter.on('dragEnd', (eventObj) => {
        // console.log('box dragEnd', eventObj);
      });
      boxSensor.emitter.on('drop', (eventObj) => {
        // console.log('box drop', eventObj);
      });
    });
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
        }}
      >
        <Layout ref={layoutRef} page={page} components={components} />
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
