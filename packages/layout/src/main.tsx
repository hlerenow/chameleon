import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { BasePage } from '@chameleon/demo-page';
import { Layout } from './Layout';
import * as antD from 'antd';
import '@chameleon/material/dist/style.css';
import './index.css';
import { Sensor, SensorEventType } from './core/dragAndDrop/sensor';

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
      boxSensor.setCanDrag((eventObj: SensorEventType) => {
        return {
          ...eventObj,
          extraData: {
            triggerData: {
              id: '111',
              componentName: 'Button',
              children: ['insertData'],
            },
          },
        };
      });
      layoutRef.current?.dnd.registerSensor(boxSensor);
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
      <div ref={leftBoxRef} style={{ border: '1px solid red', width: '300px' }}>
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
