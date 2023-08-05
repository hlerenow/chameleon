import React from 'react';
import { CPage, CPageDataType } from '@chamn/model';

import { PLUGIN_NAME } from './config';
import { Designer } from './components/Canvas';
import { DesignerPluginType } from './type';

export const DesignerPlugin: DesignerPluginType = (ctx) => {
  const designerRef = React.createRef<Designer>();
  return {
    name: PLUGIN_NAME,
    async init(ctx) {
      const workbench = ctx.getWorkbench();
      workbench.replaceBodyView(<Designer ref={designerRef} pluginCtx={ctx} />);
    },
    async destroy(ctx) {
      console.log('destroy', ctx);
    },
    export: () => {
      return {
        getInstance: () => {
          return designerRef.current;
        },
        getDnd: () => {
          return designerRef.current?.layoutRef.current?.dnd;
        },
        selectNode: async (nodeId) => {
          const node = ctx.pageModel.getNode(nodeId);
          if (node) {
            const flag = await designerRef.current?.onSelectNode(node, null);
            if (flag === false) {
              designerRef.current?.layoutRef.current?.selectNode('');
              return;
            }
          }
          designerRef.current?.layoutRef.current?.selectNode(nodeId);
        },
        getSelectedNodeId: () => {
          return designerRef.current?.layoutRef.current?.state.currentSelectId;
        },
        updatePage: (page: CPageDataType | CPage) => {
          designerRef.current?.layoutRef.current?.designRenderRef?.current?.rerender(page);
        },
        reload: ({ assets } = {}) => {
          designerRef.current?.reloadRender({ assets });
        },
        getComponentInstances: (id: string) => {
          return designerRef.current?.layoutRef.current?.designRenderRef.current?.getInstancesById(id) || [];
        },
        getDynamicComponentInstances: (id: string) => {
          const map =
            designerRef.current?.layoutRef.current?.designRenderRef.current?.renderRef.current
              ?.dynamicComponentInstanceMap;
          return map?.get(id) || ([] as any);
        },
      };
    },
    meta: {
      engine: {
        version: '1.0.0',
      },
    },
  };
};
