/* eslint-disable react/no-find-dom-node */
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import * as antD from 'antd';
import { Button } from 'antd';
import { parsePageModel } from '@chameleon/model';
import { BasePage, SamplePage } from '@chameleon/demo-page';
import { ReactAdapter } from '../index';
import '@chameleon/material/dist/style.css';
import './index.css';
import { DesignRender, useDesignRender } from '../core/designRender';

window.React = React;
export type AppProp = {
  a: string;
};

const components = {
  ...antD,
  Page: ({ children }: any) => {
    return (
      <div style={{ border: '1px solid red', padding: '10px' }}>{children}</div>
    );
  },
  div: ({ children, ...props }: any) => {
    return <div {...props}>{children}</div>;
  },
};

function App() {
  SamplePage;
  const [page] = useState(parsePageModel(BasePage));
  const renderHandle = useDesignRender();
  (window as any).renderHandle = renderHandle;
  useEffect(() => {
    // console.log('🚀 ~ file: dev.tsx ~ line 31 ~ App ~ page', page);
    // console.log('🚀 ~ file: dev.tsx ~ line 44 ~ useEffect ~ btnListDom');
    // console.log(JSON.stringify(page.export(), null, 2));

    document.documentElement.addEventListener(
      'click',
      (e) => {
        const eventTargetDom = e.target;
        const instance = renderHandle.getInstanceByDom(eventTargetDom as any);
        console.log(
          '🚀 ~ file: dev.tsx ~ line 50 ~ useEffect ~ instance',
          instance
        );
        const targetDom = renderHandle.getDomById(instance?._NODE_ID || '');
        const targetDomRectList = renderHandle.getDomRectById(
          instance?._NODE_ID || ''
        );

        console.log(
          '🚀 ~ file: dev.tsx ~ line 51 ~ useEffect ~ targetDom',
          targetDom,
          targetDomRectList
        );
      },
      true
    );
  }, []);

  // const collectionRef = (
  //   ref: React.RefObject<React.ReactInstance>,
  //   nodeMode: any
  // ) => {
  //   console.log('ref', ref, nodeMode);
  // };

  return (
    <div className="App">
      <Button>Outer</Button>
      <DesignRender
        pageModel={page}
        components={components}
        render={renderHandle}
        adapter={ReactAdapter}
      />
      {/* <Render
        pageModel={page}
        components={components}
        render={renderHandle}
        adapter={ReactAdapter}
        onGetComponent={onGetComponent}
        // onGetRef={collectionRef}
      /> */}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
