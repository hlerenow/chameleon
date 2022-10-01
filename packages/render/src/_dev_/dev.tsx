import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import * as antD from 'antd';
import { Button } from 'antd';
import { BasePage } from '@chameleon/demo-page';
import { getRenderComponent, ReactAdapter } from '../index';
import '@chameleon/material/dist/style.css';
import './index.css';

window.React = React;
export type AppProp = {
  a: string;
};

const Render = getRenderComponent(ReactAdapter);

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
  const [page, setPage] = useState(BasePage);
  const update = () => {
    const newPage = { ...page };
    newPage.componentsTree.children[0].children = [Math.random().toString()];
    setPage(newPage);
  };
  // useEffect(() => {
  //   setInterval(() => {
  //     update();
  //   }, 1000);
  // }, []);
  return (
    <div className="App">
      <Button onClick={update}>更新数据</Button>
      <Render page={page} components={components} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
