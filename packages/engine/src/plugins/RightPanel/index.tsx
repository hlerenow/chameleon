import React from 'react';
import { CPlugin } from '../../core/pluginManager';
import { CRightPanelItem, RightPanel } from './view';

const PLUGIN_NAME = 'RightPanel';
export const RightPanelPlugin: CPlugin = (ctx) => {
  const uiHandle = React.createRef<RightPanel>();
  return {
    name: PLUGIN_NAME,
    async init(ctx) {
      const workbench = ctx.getWorkbench();
      workbench.replaceRightView(<RightPanel ref={uiHandle} pluginCtx={ctx} />);
    },
    async destroy(ctx) {
      console.log('destroy', ctx);
    },
    exports: (ctx) => {
      return uiHandle?.current;
    },
    meta: {
      engine: {
        version: '1.0.0',
      },
    },
  };
};
