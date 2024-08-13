import { CMaterialType, CNode } from '@chamn/model';
import { snippets, snippetsGridItem } from './snippets';
import { LayoutWrap } from './edit/layoutWrap';
import { useEffect, useState } from 'react';
import { EnginContext } from '@chamn/engine';
import { DesignerPluginInstance } from '@chamn/engine/dist/plugins/Designer/type';
import React from 'react';

export const ReactGridLayoutMeta: CMaterialType = {
  componentName: 'RGridLayout',
  title: '高级布局',
  props: [],
  isContainer: true,
  category: '布局',
  groupName: '高级布局',
  npm: {
    name: 'ReactGridLayout',
    package: __PACKAGE_NAME__ || '',
    version: __PACKAGE_VERSION__,
    destructuring: true,
    exportName: 'ReactGridLayout',
  },
  snippets: snippets,
  advanceCustom: {
    wrapComponent: (Comp, options) => {
      return (props: any) => {
        const [iframeWindow, setIframeWindow] = useState();
        useEffect(() => {
          const ctx: EnginContext = options.ctx;
          ctx.pluginManager
            .onPluginReadyOk('Designer')
            .then((ins: DesignerPluginInstance) => {
              const win = ins.export.getDesignerWindow();
              setIframeWindow(win as any);
            });
        }, []);

        if (!iframeWindow) {
          return <></>;
        }

        return (
          <LayoutWrap
            {...props}
            {...options}
            targetComp={Comp}
            subWin={iframeWindow}
          />
        );
      };
    },
  },
};

export const ReactGridItemMeta: CMaterialType = {
  componentName: 'GridItem',
  title: '高级布局容器',
  category: '布局',
  groupName: '高级布局',
  props: [],
  isContainer: true,
  npm: {
    name: 'GridItem',
    package: __PACKAGE_NAME__ || '',
    version: __PACKAGE_VERSION__,
    destructuring: true,
    exportName: 'GridItem',
  },
  disableEditorDragDom: true,

  advanceCustom: {
    onDragStart: async () => {
      return false;
    },
    wrapComponent: (Comp, options) => {
      return (props: any) => {
        return <Comp {...props} {...options} dev={true} />;
      };
    },
    canDropNode: async (node, params) => {
      const { dropNode } = params;
      if (!dropNode) {
        return false;
      }
      if (dropNode.value.componentName === 'ReactGridLayout') {
        return true;
      }

      return false;
    },
    onCopy: async (node) => {
      node.props.x.updateValue('');
      node.props.y.updateValue('');
      return true;
    },
    onNewAdd: async (node, params) => {
      const { dropNode } = params;
      if (!dropNode) {
        return false;
      }
      if (dropNode.value.componentName === 'ReactGridLayout') {
        return true;
      }

      return false;
    },
  },
  snippets: snippetsGridItem,
};

export default [ReactGridLayoutMeta, ReactGridItemMeta];

export type A = string;
