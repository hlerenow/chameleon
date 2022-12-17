import { BasePage } from '@chameleon/demo-page';
import React, { useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import Engine, { EnginContext } from './Engine';
import './index.css';
import { DEFAULT_PLUGIN_LIST } from './plugins';
import { DesignerPlugin } from './plugins/Designer';

const App = () => {
  const onReady = useCallback((ctx: EnginContext) => {
    console.log(ctx);
    const designer = ctx.pluginManager.get(DesignerPlugin.name);
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
