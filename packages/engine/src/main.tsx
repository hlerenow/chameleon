import React from 'react';
import ReactDOM from 'react-dom/client';
import Engine from './Engine';
import './index.css';
import { DEFAULT_PLUGIN_LIST } from './plugins';

const App = () => {
  return <Engine plugins={DEFAULT_PLUGIN_LIST} />;
};
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
