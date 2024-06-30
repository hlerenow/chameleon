import { CMaterials } from '../../src/Material/index';
import { AdvanceDataType, BaseDataType, CMaterialType, ShapeDataType, SpecialDataType } from '../../src/types/material';

const mockMaterialData: CMaterialType[] = [
  {
    title: '测试物料组件',
    componentName: 'Header',
    category: '默认',
    groupName: 'A',
    npm: {
      package: 'antd',
      version: '1.0.0',
      exportName: 'Button',
      destructuring: true,
    },
    props: [
      {
        name: 'text',
        title: '文本',
        defaultValue: '按钮',
        setters: ['StringSetter'],
        valueType: {
          type: AdvanceDataType.SHAPE,
          value: [
            {
              name: 'key1',
              title: 'key1',
              valueType: {
                type: AdvanceDataType.SHAPE,
                value: [
                  {
                    name: 'key2',
                    title: 'key2',
                    valueType: BaseDataType.STRING,
                  },
                ],
              },
            },
            {
              name: 'renderItem',
              title: '渲染子元素',
              valueType: SpecialDataType.COMPONENT,
            },
            {
              name: 'expression',
              title: '表达式',
              valueType: SpecialDataType.EXPRESSION,
            },
          ],
        } as ShapeDataType,
      },
      {
        name: 'renderItem',
        title: '渲染子元素',
        valueType: SpecialDataType.COMPONENT,
      },
      {
        name: 'expression',
        title: '表达式',
        valueType: SpecialDataType.EXPRESSION,
      },
    ],
    snippets: [
      {
        title: 'demo',
        schema: {
          props: {
            a: 1,
          },
        },
      },
      {
        title: 'demo2',
        schema: {
          props: {
            a: 1,
          },
        },
      },
    ],
  },
  {
    title: '测试物料组件',
    componentName: 'Header2',
    category: '高级2',
    groupName: 'B',
    npm: {
      package: 'antd',
      version: '1.0.0',
      exportName: 'Button',
      destructuring: true,
    },
    props: [
      {
        name: 'text',
        title: '文本',
        defaultValue: '按钮',
        setters: ['StringSetter'],
        valueType: {
          type: AdvanceDataType.SHAPE,
          value: [
            {
              name: 'key1',
              title: 'key1',
              valueType: {
                type: AdvanceDataType.SHAPE,
                value: [
                  {
                    name: 'key2',
                    title: 'key2',
                    valueType: BaseDataType.STRING,
                  },
                ],
              },
            },
            {
              name: 'renderItem',
              title: '渲染子元素',
              valueType: SpecialDataType.COMPONENT,
            },
            {
              name: 'expression',
              title: '表达式',
              valueType: SpecialDataType.EXPRESSION,
            },
          ],
        } as ShapeDataType,
      },
      {
        name: 'renderItem',
        title: '渲染子元素',
        valueType: SpecialDataType.COMPONENT,
      },
      {
        name: 'expression',
        title: '表达式',
        valueType: SpecialDataType.EXPRESSION,
      },
    ],
    snippets: [
      {
        title: 'demo',
        schema: {
          props: {
            a: 1,
          },
        },
      },
      {
        title: 'demo2',
        schema: {
          props: {
            a: 1,
          },
        },
      },
    ],
  },
];

describe('test page model', () => {
  it('new a page instance', () => {
    const node = new CMaterials(mockMaterialData);
    expect(node).not.toBeNull();
  });

  it('get all snippets', () => {
    const node = new CMaterials(mockMaterialData);
    expect(node).not.toBeNull();
    expect(node.getAllSnippets().length).not.toEqual(0);
  });
});
