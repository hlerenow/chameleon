import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import * as antD from 'antd';
import { Button } from 'antd';
import { BasePage, SamplePage } from '@chameleon/demo-page';
import { Render, ReactAdapter, useRender } from '../index';
import '@chameleon/material/dist/style.css';
import './index.css';

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
  div: (props: any) => {
    return <div {...props}>I am Div</div>;
  },
};

function App() {
  SamplePage;
  const [page, setPage] = useState(BasePage);
  const update = () => {
    const newPage = { ...page };
    // newPage.componentsTree.children[1].children = [Math.random().toString()];
    newPage.componentsTree.children = [];
    setPage(newPage);
    console.log('🚀 ~ file: dev.tsx ~ line 34 ~ update ~ newPage', newPage);
    renderHandle.rerender(newPage);
  };
  const renderHandle = useRender();
  (window as any).renderHandle = renderHandle;
  // useEffect(() => {
  //   setInterval(() => {
  //     update();
  //   }, 1000);
  // }, []);
  return (
    <div className="App">
      <Button onClick={update}>更新数据</Button>
      <Render
        page={page}
        components={components}
        render={renderHandle}
        adapter={ReactAdapter}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
