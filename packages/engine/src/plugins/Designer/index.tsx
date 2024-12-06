import React from 'react';
import { CPage, CPageDataType } from '@chamn/model';

import { PLUGIN_NAME } from './config';
import { Designer } from './components/Canvas';
import { DesignerPluginType } from './type';

export const DesignerPlugin: DesignerPluginType = () => {
  const designerRef = React.createRef<Designer>();
  return {
    name: PLUGIN_NAME,
    async init(ctx) {
      ctx.name = PLUGIN_NAME;
      const workbench = ctx.getWorkbench();
      workbench.replaceBodyView(<Designer ref={designerRef} pluginCtx={ctx} />);
    },
    async destroy(ctx) {
      console.log('destroy', ctx);
    },
    export: () => {
      return {
        setCanvasWidth(width: number | string) {
          const iframeContainer = designerRef.current?.getIframeDom();

          if (iframeContainer?.containerDom) {
            let newW = width;
            if (typeof width === 'number') {
              newW = `${width}px`;
            }
            iframeContainer.containerDom.style.width = String(newW);
            iframeContainer.containerDom.style.margin = '0 auto';
          }
        },
        getIframeDom() {
          return designerRef.current?.getIframeDom();
        },
        getInstance: () => {
          return designerRef.current;
        },
        getDnd: () => {
          return designerRef.current?.layoutRef.current?.dnd;
        },
        selectNode: async (nodeId) => {
          designerRef.current?.toSelectNode(nodeId);
        },
        copyNode: async (nodeId) => {
          designerRef.current?.toCopyNode(nodeId);
        },
        deleteNode: async (nodeId) => {
          designerRef.current?.toDeleteNode(nodeId);
        },
        getSelectedNodeId: () => {
          return designerRef.current?.layoutRef.current?.state.currentSelectId;
        },
        updatePage: (page: CPageDataType | CPage) => {
          designerRef.current?.layoutRef.current?.designRenderRef?.current?.rerender(page);
        },
        reload: () => {
          designerRef.current?.reloadRender();
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
        getLayoutRef: () => {
          return designerRef.current?.layoutRef as any;
        },
        getDesignerWindow: () => {
          return designerRef.current?.layoutRef.current?.iframeContainer.getWindow() as any;
        },
        updateRenderComponents: (newComponents: Record<string, string>) => {
          return designerRef.current?.updateRenderComponents(newComponents);
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
