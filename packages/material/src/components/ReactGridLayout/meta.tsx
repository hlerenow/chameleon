import { useCallback, useRef } from 'react';
import { CMaterialType } from '@chamn/model';
import { snippets, snippetsGridItem } from './snippets';
import { LayoutWrap } from './edit/layoutWrap';
import { useEffect, useState } from 'react';
import { EnginContext } from '@chamn/engine';
import { DesignerPluginInstance } from '@chamn/engine/dist/plugins/Designer/type';
import { GridStack } from 'gridstack';
import { breakpoints } from './config';
import { DesignerCtx } from '@chamn/engine/dist/plugins/Designer/components/Canvas';
import { debounce } from 'lodash-es';
import { GridItemPropsType } from './GridItem';

export const ReactGridLayoutMeta: CMaterialType = {
  componentName: 'GridLayout',
  title: '高级布局',
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
  category: '布局',
  groupName: '高级布局',
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

const GRID_ITEM_INSTANCE_MAP: any = {};

export const ReactGridItemMeta: CMaterialType = {
  componentName: 'GridItem',
  title: '高级布局容器',
  category: '布局',
  groupName: '高级布局',
  props: [
    {
      name: 'responsive',
      title: 'Responsive',
      setters: [
        {
          componentName: 'ArraySetter',
          initialValue: breakpoints,
          props: {
            collapse: {
              open: true,
            },
            item: {
              initialValue: { w: 0, label: 'customSize' },
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
                        setters: [
                          {
                            componentName: 'StringSetter',
                            props: {
                              disabled: true,
                            },
                          },
                        ],
                        valueType: 'number',
                      },
                      {
                        name: 'info',
                        title: 'info',
                        valueType: 'object',
                        setters: [
                          {
                            componentName: 'ShapeSetter',
                            initialValue: {
                              with: 0,
                              label: '',
                            },
                            props: {
                              collapse: false,
                              elements: [
                                {
                                  name: 'w',
                                  title: 'width',
                                  setters: ['NumberSetter', 'ExpressionSetter'],
                                  valueType: 'number',
                                },
                                {
                                  name: 'h',
                                  title: 'height',
                                  setters: ['NumberSetter', 'ExpressionSetter'],
                                  valueType: 'number',
                                },
                                {
                                  name: 'x',
                                  title: 'offsetX',
                                  setters: ['NumberSetter', 'ExpressionSetter'],
                                  valueType: 'number',
                                },
                                {
                                  name: 'y',
                                  title: 'offsetY',
                                  setters: ['NumberSetter', 'ExpressionSetter'],
                                  valueType: 'number',
                                },
                              ],
                            },
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      ],
      valueType: 'number',
    },
  ],
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
    autoGetDom: false,
    toolbarViewRender: ({ node, context, toolBarItemList }) => {
      const [posInfo, setPostInfo] = useState({
        label: '',
        w: 0,
        h: 0,
        x: 0,
        y: 0,
      });

      const getNodePosAndSizeInfo = debounce(async () => {
        const compInsRef = GRID_ITEM_INSTANCE_MAP[node.id];
        if (!compInsRef) {
          return;
        }
        const posInfo = compInsRef.current?.getCurrentPosAndSizeInfo();
        setPostInfo({
          label: posInfo.label,
          x: posInfo.info?.x,
          y: posInfo.info?.y,
          w: posInfo.info?.w,
          h: posInfo.info?.h,
        });
      }, 100);

      const registerResize = async () => {
        node.onChange(getNodePosAndSizeInfo);
        const ctx = context as DesignerCtx;
        const designer = await ctx.pluginManager.get<DesignerPluginInstance>(
          'Designer'
        );

        const subWin = designer?.export.getDesignerWindow();
        subWin?.addEventListener('resize', getNodePosAndSizeInfo);
        window?.addEventListener('resize', getNodePosAndSizeInfo);
      };
      const removeListener = async () => {
        const ctx = context as DesignerCtx;
        const designer = await ctx.pluginManager.get<DesignerPluginInstance>(
          'Designer'
        );

        const subWin = designer?.export.getDesignerWindow();
        subWin?.removeEventListener('resize', getNodePosAndSizeInfo);
        window.removeEventListener('resize', getNodePosAndSizeInfo);
      };
      useEffect(() => {
        getNodePosAndSizeInfo();
        registerResize();
        return () => {
          removeListener();
        };
      }, []);
      return (
        <div
          style={{
            display: 'flex',
            float: 'right',
            zIndex: 999,
            pointerEvents: 'all',
          }}
        >
          <div
            style={{
              background: 'white',
              marginRight: '5px',
              fontSize: '12px',
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <b
              style={{
                paddingRight: '2px',
                color: 'red',
              }}
            >
              {posInfo.label}
            </b>
            | w: {posInfo.w} | h: {posInfo.h} | x: {posInfo.x} | y: {posInfo.y}
          </div>
          {toolBarItemList}
        </div>
      );
    },
    onDragStart: async () => {
      return false;
    },
    wrapComponent: (Comp, options) => {
      return (props: any) => {
        return (
          <Comp
            {...props}
            {...options}
            dev={true}
            onGetRef={(ref: any) => {
              GRID_ITEM_INSTANCE_MAP[options.node.id] = ref;
            }}
          />
        );
      };
    },
    canDropNode: async (node, params) => {
      const { dropNode } = params;
      if (!dropNode) {
        return false;
      }
      if (dropNode.value.componentName === 'GridLayout') {
        return true;
      }

      return false;
    },
    onCopy: async (node) => {
      const newProps: GridItemPropsType = node.getPlainProps();
      const newResponsive = newProps.responsive.map((el) => {
        return {
          ...el,
          x: '',
          y: '',
        };
      });
      newProps.responsive = newResponsive;
      node.updateValue({
        props: newProps,
      });
      return true;
    },
    onNewAdd: async (node, params) => {
      const { dropNode } = params;
      if (!dropNode) {
        return false;
      }
      if (dropNode.value.componentName === 'GridLayout') {
        return true;
      }

      return false;
    },
  },
  snippets: snippetsGridItem,
};

export default [ReactGridLayoutMeta, ReactGridItemMeta];

export type A = string;
