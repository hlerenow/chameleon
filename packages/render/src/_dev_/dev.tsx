import React from 'react';
import ReactDOM from 'react-dom/client';
import * as antD from 'antd';
import { BasePage } from '@chameleon/demo-page';
import { getRenderComponent, ReactAdapter } from '../index';
import '@chameleon/material/dist/style.css';
import './index.css';

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
};

function App() {
  return (
    <div className="App">
      <Render page={BasePage} components={components} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
