import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { BasePage } from '@chameleon/demo-page';
import Layout from './Layout';
import * as antD from 'antd';
import '@chameleon/material/dist/style.css';
import './index.css';

console.log(window, React, ReactDOMAll);
(window as any).React = React;
(window as any).ReactDOM = ReactDOMAll;

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

const App = () => {
  const [page] = useState<any>(BasePage);
  return <Layout page={page} components={components} />;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
