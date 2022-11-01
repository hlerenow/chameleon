import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import ReactDOMAll from 'react-dom';
import { BasePage } from '@chameleon/demo-page';
import { Layout } from './Layout';
import * as antD from 'antd';
import '@chameleon/material/dist/style.css';
import './index.css';

(window as any).React = React;
(window as any).ReactDOM = ReactDOMAll;

const components = {
  ...antD,
};

const App = () => {
  const [page] = useState<any>(BasePage);
  return <Layout page={page} components={components} />;
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
