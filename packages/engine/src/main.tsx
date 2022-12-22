import { BasePage } from '@chameleon/demo-page';
import React, { useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import Engine, { EnginContext } from './Engine';
import './index.css';
import { DEFAULT_PLUGIN_LIST } from './plugins';
import { Tooltip } from 'antd';

const App = () => {
  const onReady = useCallback((ctx: EnginContext) => {
    const designer = ctx.pluginManager.get('Designer');

    designer?.ctx.emitter.on('ready', (uiInstance) => {
      console.log('out ready', uiInstance);
    });
  }, []);
  return (
    <Engine
      plugins={DEFAULT_PLUGIN_LIST}
      schema={BasePage as any}
      onReady={onReady}
    />
  );
};
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />
);
