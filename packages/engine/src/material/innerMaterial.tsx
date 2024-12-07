import { CMaterialPropsType, CMaterialType, HTMl_TAGS } from '@chamn/model';
import { capitalize } from 'lodash-es';

const customAttributesMeta: CMaterialPropsType[number] = {
  name: '$$attributes',
  title: '属性',
  valueType: 'object',
  setters: [
    {
      componentName: 'ArraySetter',
      props: {
        item: {
          setters: [
            {
              componentName: 'ShapeSetter',
              props: {
                elements: [
                  {
                    name: 'key',
                    title: '属性名',
                    valueType: 'string',
                    setters: ['StringSetter'],
                  },
                  {
                    name: 'value',
                    title: '值',
                    valueType: 'string',
                    setters: ['StringSetter', 'NumberSetter', 'JSONSetter', 'FunctionSetter', 'ExpressionSetter'],
                  },
                ],
                collapse: false,
              },
              initialValue: {},
            },
          ],
          initialValue: {},
        },
      },
      initialValue: [],
    },
  ],
};

const INNER_META_VERSION = '1.0.0';
const PKG_NAME = 'CHAMELEON_INNER_PKG';

const htmlNativeComponentMeta = HTMl_TAGS.map((tag) => {
  const DivMeta: CMaterialType = {
    title: capitalize(tag),
    componentName: tag,
    props: [customAttributesMeta],
    snippets: [],
    npm: {
      name: tag,
      package: PKG_NAME,
      version: INNER_META_VERSION,
    },
  };

  return DivMeta;
});

const BaseComponentMeta: CMaterialType[] = [
  {
    title: '块',
    componentName: 'CBlock',
    props: [
      {
        name: 'children',
        title: '文本',
        valueType: 'string',
        setters: ['StringSetter', 'ExpressionSetter'],
      },
      customAttributesMeta,
    ],
    groupName: '原子组件',
    snippets: [
      {
        title: '块',
        snapshotText: 'Block',
        category: '基础组件',
        schema: {
          props: {},
          css: {
            value: [
              {
                state: 'normal',
                media: [],
                text: 'background: white ; width: 100%; height: 100px',
              },
            ],
          },
        },
      },
    ],
  },
  {
    title: '容器',
    componentName: 'CContainer',
    isContainer: true,
    props: [
      {
        name: 'afterMount',
        title: '渲染之后',
        valueType: 'function',
        setters: ['FunctionSetter', 'ExpressionSetter', 'TestSetter' as any],
      },
      {
        name: 'beforeDestroy',
        title: '销毁之前',
        valueType: 'function',
        setters: ['FunctionSetter', 'ExpressionSetter'],
      },
      customAttributesMeta,
    ],
    groupName: '原子组件',
    snippets: [
      {
        title: '容器',
        snapshotText: 'Con',
        category: '基础组件',
        schema: {
          css: {
            value: [
              {
                state: 'normal',
                media: [],
                text: 'background: white;width: 100%;',
              },
            ],
          },
        },
      },
    ],
  },
  {
    title: '图片',
    componentName: 'CImage',
    props: [
      {
        name: 'src',
        title: '地址',
        valueType: 'string',
        setters: ['StringSetter', 'ExpressionSetter'],
      },
      customAttributesMeta,
    ],
    advanceCustom: {
      wrapComponent: (comp) => {
        return (props: any) => {
          const Comp = comp;
          return <Comp {...props} style={{ ...(props.style || {}), userSelect: 'none', WebkitUserDrag: 'none' }} />;
        };
      },
    },

    groupName: '原子组件',
    snippets: [
      {
        title: '图片',
        snapshotText: 'Img',
        category: '基础组件',
        schema: {
          css: {
            value: [
              {
                text: 'background:white;width:500px;height:300px;overflow:auto;',
                media: [],
                state: 'normal',
              },
            ],
          },
          props: {
            src: 'https://images.unsplash.com/photo-1584080277544-2db5b2c2d9dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
          },
        },
      },
    ],
  },
  {
    title: '视频',
    componentName: 'CVideo',
    props: [
      {
        name: 'src',
        title: '地址',
        valueType: 'string',
        setters: ['StringSetter', 'ExpressionSetter'],
      },
      {
        name: 'autoPlay',
        title: '自动播放',
        valueType: 'string',
        setters: ['BooleanSetter', 'ExpressionSetter'],
      },
      {
        name: 'controls',
        title: '控制面板',
        valueType: 'string',
        setters: ['BooleanSetter', 'ExpressionSetter'],
      },
      customAttributesMeta,
    ],
    fixedProps: {
      autoPlay: false,
    },
    advanceCustom: {
      wrapComponent: (Comp) => {
        return (props) => {
          //  原生的控制面板会阻断页面级别的事件监听，导致拖拽失效，这里在编辑态禁用 video 的控制面板相关事件触发
          return (
            <div
              style={{
                ...props.style,
                display: 'inline-flex',
              }}
            >
              <Comp
                {...props}
                style={{
                  ...props.style,
                  pointerEvents: 'none',
                }}
              ></Comp>
            </div>
          );
        };
      },
    },
    groupName: '原子组件',
    snippets: [
      {
        title: '视频',
        snapshotText: 'Video',
        category: '基础组件',
        schema: {
          props: {
            src: 'https://vjs.zencdn.net/v/oceans.mp4',
          },
          css: {
            value: [
              {
                state: 'normal',
                media: [],
                text: 'background:white;width:300px;height:150px;',
              },
            ],
          },
        },
      },
    ],
  },
  {
    title: '音频',
    groupName: '原子组件',
    componentName: 'CAudio',
    props: [
      {
        name: 'src',
        title: '地址',
        valueType: 'string',
        setters: ['StringSetter', 'ExpressionSetter'],
      },
      {
        name: 'autoPlay',
        title: '自动播放',
        valueType: 'string',
        setters: ['BooleanSetter', 'ExpressionSetter'],
      },
      {
        name: 'controls',
        title: '控制面板',
        valueType: 'string',
        setters: ['BooleanSetter', 'ExpressionSetter'],
      },
      customAttributesMeta,
    ],
    advanceCustom: {
      wrapComponent: () => {
        return (props) => {
          return (
            <div
              style={{
                display: 'inline-block',
                fontSize: 0,
              }}
            >
              <audio
                {...props}
                style={{
                  pointerEvents: 'none',
                  ...props.style,
                }}
              ></audio>
            </div>
          );
        };
      },
    },
    snippets: [
      {
        title: '音频',
        snapshotText: 'Audio',
        category: '基础组件',
        schema: {
          props: {
            src: 'https://vjs.zencdn.net/v/oceans.mp4',
            controls: true,
          },
        },
      },
    ],
  },
  {
    title: '文本',
    componentName: 'CText',
    groupName: '原子组件',
    props: [
      {
        name: 'content',
        title: '内容',
        valueType: 'string',
        setters: ['TextAreaSetter', 'ExpressionSetter'],
      },
      customAttributesMeta,
    ],
    snippets: [
      {
        title: '文本',
        snapshotText: 'Text',
        category: '基础组件',
        schema: {
          props: {
            content: 'text',
          },
        },
      },
    ],
  },
  {
    title: 'Canvas',
    componentName: 'CCanvas',
    props: [
      {
        name: 'afterMount',
        title: '渲染之后',
        valueType: 'function',
        setters: ['FunctionSetter', 'ExpressionSetter', 'TestSetter' as any],
      },
      {
        name: 'beforeDestroy',
        title: '销毁之前',
        valueType: 'function',
        setters: ['FunctionSetter', 'ExpressionSetter'],
      },
      customAttributesMeta,
    ],
    groupName: '原子组件',
    advanceCustom: {
      onNewAdd: async (node) => {
        const props = node.getPlainProps();
        const id = Math.random().toString(32).slice(3, 9);
        props.$$attributes = [
          {
            key: 'id',
            value: id,
          },
          {
            key: 'style',
            value: {
              display: 'block',
              margin: '0 auto',
            },
          },
        ];
        props.afterMount.value = props.afterMount.value.replace('$[id]', id);
        node.updateWithPlainObj({
          props,
        });
        return {
          addNode: node,
        };
      },
    },
    snippets: [
      {
        title: '画布',
        snapshotText: 'Cavs',
        category: '基础组件',
        schema: {
          props: {
            width: '600px',
            height: '150px',
            style: {
              margin: '0 auto',
            },
            afterMount: {
              type: 'FUNCTION',
              value: `
              function run () {
                var ctx = document.getElementById("$[id]").getContext("2d");
                ctx.font = "48px serif";
                ctx.fillText("Hello Canvas", 10, 50);
              }
              `,
            },
          },
        },
      },
    ],
  },
  {
    title: 'HTML 标签',
    componentName: 'CNativeTag',
    props: [
      {
        name: 'htmlTag',
        title: '标签名',
        valueType: 'string',
        setters: [
          {
            componentName: 'SelectSetter',
            props: {
              options: HTMl_TAGS.map((tag) => {
                return {
                  name: tag,
                  value: tag,
                };
              }),
            },
          },
        ],
      },
      customAttributesMeta,
    ],
    isContainer: true,
    groupName: '原子组件',
    snippets: [
      {
        title: 'HTML',
        snapshotText: 'HTML',
        category: '基础组件',
        schema: {
          props: {
            htmlTag: 'div',
          },
        },
      },
    ],
  },
];

const BaseComponentMetaWithVersion = BaseComponentMeta.map((el) => {
  return {
    ...el,
    npm: {
      name: el.componentName,
      package: PKG_NAME,
      version: INNER_META_VERSION,
    },
  };
});

export const InnerComponentMeta = [...BaseComponentMetaWithVersion, ...htmlNativeComponentMeta];
