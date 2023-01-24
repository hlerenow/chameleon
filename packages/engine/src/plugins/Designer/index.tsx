import React from 'react';
import { DragAndDrop } from '@chameleon/layout';
import '@chameleon/layout/dist/style.css';
import { CPlugin } from '../../core/pluginManager';
import { PLUGIN_NAME } from './config';
import { Designer } from './view';
import { CPageDataType } from '@chameleon/model';

export const DesignerPlugin: CPlugin = () => {
  const designerRef = React.createRef<Designer>();
  return {
    name: PLUGIN_NAME,
    async init(ctx) {
      ctx.workbench.replaceBodyView(
        <Designer ref={designerRef} pluginCtx={ctx} />
      );
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
        updatePage: (page: CPageDataType) => {
          designerRef.current?.layoutRef.current?.designRenderRef?.current?.rerender(
            page
          );
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
  getDnd: () => DragAndDrop;
  selectNode: (nodeId: string) => void;
  updatePage: (page: CPageDataType) => void;
};
