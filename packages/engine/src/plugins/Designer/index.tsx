import React from 'react';
import { DragAndDrop } from '@chameleon/layout';
import '@chameleon/layout/dist/style.css';
import { CPlugin } from '../../core/pluginManager';
import { PLUGIN_NAME } from './config';
import { Designer } from './view';
import { AssetPackage, CPage, CPageDataType } from '@chameleon/model';
import { RenderInstance } from '@chameleon/render';

export const DesignerPlugin: CPlugin = (ctx) => {
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
    exports: () => {
      return {
        getReadyStatus: () => {
          return designerRef.current?.ready;
        },
        getDnd: () => {
          return designerRef.current?.layoutRef.current?.dnd;
        },
        selectNode: (nodeId) => {
          designerRef.current?.layoutRef.current?.selectNode(nodeId);
        },
        updatePage: (page: CPageDataType | CPage) => {
          designerRef.current?.layoutRef.current?.designRenderRef?.current?.rerender(
            page
          );
        },
        reload: ({ assets }) => {
          designerRef.current?.reloadRender({ assets });
        },
        getComponentInstances: (id: string) => {
          return (
            designerRef.current?.layoutRef.current?.designRenderRef.current?.getInstancesById(
              id
            ) || []
          );
        },
        getDynamicComponentInstances: (id: string) => {
          const map =
            designerRef.current?.layoutRef.current?.designRenderRef.current
              ?.renderRef.current?.dynamicComponentInstanceMap;
          return map?.get(id) || [];
        },
      } as DesignerExports;
    },
    meta: {
      engine: {
        version: '1.0.0',
      },
    },
  };
};

export type DesignerExports = {
  reload: (params: { assets: AssetPackage[] }) => void;
  getDnd: () => DragAndDrop;
  selectNode: (nodeId: string) => void;
  updatePage: (page: CPageDataType) => void;
  getComponentInstances: (id: string) => RenderInstance[];
  getDynamicComponentInstances: (id: string) => RenderInstance;
};
