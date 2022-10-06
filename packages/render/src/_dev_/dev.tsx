import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import * as antD from 'antd';
import { Button } from 'antd';
import { BasePage, SamplePage } from '@chameleon/demo-page';
import { Render, ReactAdapter, useRender } from '../index';
import '@chameleon/material/dist/style.css';
import './index.css';
import { parsePageModel } from '@chameleon/model';

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
  const [page, setPage] = useState(parsePageModel(BasePage));
  const renderHandle = useRender();
  (window as any).renderHandle = renderHandle;
  useEffect(() => {
    console.log('🚀 ~ file: dev.tsx ~ line 31 ~ App ~ page', page);
    console.log(JSON.stringify(page.export(), null, 2));
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
      <Render
        pageModel={page}
        components={components}
        render={renderHandle}
        adapter={ReactAdapter}
        // onGetRef={collectionRef}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
