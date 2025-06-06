import React from 'react';
import { CPlugin } from '../../core/pluginManager';
import { RightPanel } from './view';
import { RightPanelConfig } from './type';

const PLUGIN_NAME = 'RightPanel';
export const RightPanelPlugin: CPlugin<RightPanelConfig> = () => {
  const uiHandle = React.createRef<RightPanel>();
  return {
    name: PLUGIN_NAME,
    PLUGIN_NAME,
    async init(ctx) {
      const workbench = ctx.getWorkbench();
      workbench.replaceRightView(<RightPanel ref={uiHandle} pluginCtx={ctx} />);
    },
    async destroy() {},
    export: () => {
      return uiHandle?.current;
    },
    meta: {
      engine: {
        version: '1.0.0',
      },
    },
  };
};

RightPanelPlugin.PLUGIN_NAME = PLUGIN_NAME;
