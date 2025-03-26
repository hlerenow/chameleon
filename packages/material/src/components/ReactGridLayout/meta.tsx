import { CMaterialType } from '@chamn/model';
import { snippets } from './snippets';
import { LayoutWrap } from './edit/layoutWrap';
import { useEffect, useState, useCallback, useRef } from 'react';
import { EnginContext } from '@chamn/engine';
import { DesignerPluginInstance } from '@chamn/engine/dist/plugins/Designer/type';
import { GridStack } from 'gridstack';
import { breakpoints } from './config';

export const ReactGridLayoutMeta: CMaterialType = {
  componentName: 'GridLayout',
  title: '高级布局画布',
  props: [
    {
      name: 'breakpoints',
      title: 'Breakpoints',
      setters: [
        {
          componentName: 'ArraySetter',
          initialValue: breakpoints,
          props: {
            collapse: {
              open: true,
            },
            item: {
              initialValue: { w: 0, label: '' },
              setters: [
                {
                  componentName: 'ShapeSetter',
                  initialValue: {
                    with: 0,
                    c: 0,
                  },
                  props: {
                    collapse: {
                      open: true,
                    },
                    elements: [
                      {
                        name: 'label',
                        title: 'label',
                        setters: ['StringSetter'],
                        valueType: 'string',
                      },
                      {
                        name: 'w',
                        title: 'width',
                        setters: [
                          {
                            componentName: 'NumberSetter',
                            props: {
                              suffix: 'px',
                            },
                          },
                        ],
                        valueType: 'number',
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      ],
      valueType: 'array',
    },
  ],
  isContainer: true,
  category: '高级布局',
  groupName: '内置组件',
  npm: {
    name: 'GridLayout',
    package: __PACKAGE_NAME__ || '',
    version: __PACKAGE_VERSION__,
    destructuring: true,
    exportName: 'GridLayout',
  },
  snippets: snippets,
  advanceCustom: {
    autoGetDom: false,
    wrapComponent: (Comp, options) => {
      return (props: any) => {
        const [iframeWindow, setIframeWindow] = useState();
        const designerRef = useRef<DesignerPluginInstance>();
        useEffect(() => {
          const ctx: EnginContext = options.ctx;
          ctx.pluginManager
            .onPluginReadyOk('Designer')
            .then((ins: DesignerPluginInstance) => {
              designerRef.current = ins;
              const win = ins.export.getDesignerWindow();
              setIframeWindow(win as any);
            });
        }, []);

        const onGridMount = useCallback((grid: GridStack) => {
          grid.on('dragstart', () => {
            designerRef.current?.export.getLayoutRef().current?.banSelectNode();
          });
          grid.on('dragstop', (event) => {
            setTimeout(() => {
              designerRef.current?.export
                .getLayoutRef()
                .current?.recoverSelectNode();
              const nodeId = (event.target as any)?.getAttribute(
                'data-grid-id'
              );
              designerRef.current?.export
                .getLayoutRef()
                .current?.selectNode(nodeId);
            }, 0);
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
            onMount={onGridMount}
          />
        );
      };
    },
    rightPanel: {
      visual: false,
    },
  },
};

export default [ReactGridLayoutMeta];
