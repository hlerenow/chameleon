import { CMaterialType } from '@chameleon/model';

export const TableMeta: CMaterialType = {
  title: 'Table',
  componentName: 'Table',
  npm: {
    package: '@chameleon/mock-material',
    exportName: 'Table',
    version: '1.0.0',
  },
  icon: 'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
  props: [
    {
      name: 'name',
      title: '样式',
      valueType: 'string',
      setters: [
        'StringSetter',
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
                        name: 'name',
                        title: '列名',
                        valueType: 'string',
                        setters: ['StringSetter'],
                      },
                      {
                        name: 'dataIndex',
                        title: 'dataIndex',
                        valueType: 'string',
                        setters: ['StringSetter'],
                      },
                      {
                        name: 'filteredValue',
                        title: '过滤值',
                        valueType: 'array',
                        setters: ['StringSetter'],
                      },
                    ],
                  },
                  initialValue: {},
                },
              ],
            },
          },
          initialValue: [],
        },
        {
          componentName: 'ExpressionSetter',
          initialValue: [],
        },
      ],
    },
    {
      name: 'style',
      title: '样式',
      valueType: 'object',
      setters: ['JSONSetter'],
    },
    {
      name: 'columns',
      title: '数据列',
      valueType: 'array',
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
                        name: 'name',
                        title: '列名',
                        valueType: 'string',
                        setters: ['StringSetter'],
                      },
                      {
                        name: 'dataIndex',
                        title: 'dataIndex',
                        valueType: 'string',
                        setters: ['StringSetter'],
                      },
                      {
                        name: 'filteredValue',
                        title: '过滤值',
                        valueType: 'array',
                        setters: ['StringSetter'],
                      },
                    ],
                  },
                  initialValue: {},
                },
              ],
            },
          },
          initialValue: [],
        },
        {
          componentName: 'ExpressionSetter',
          initialValue: [],
        },
      ],
    },
    {
      name: 'pagination',
      title: '分页',
      valueType: 'object',
      setters: [
        {
          componentName: 'ShapeSetter',
          props: {
            elements: [
              {
                name: 'current',
                title: '当前页',
                valueType: 'number',
                setters: ['NumberSetter', 'ExpressionSetter'],
              },
            ],
          },
          initialValue: {},
        },
      ],
    },
    {
      name: 'sorter',
      title: '排序',
      valueType: 'function',
      setters: ['FunctionSetter', 'ExpressionSetter'],
    },
    {
      name: 'title',
      title: '表头',
      valueType: 'component',
      setters: ['ComponentSetter'],
    },
  ],
  snippets: [
    {
      title: '表格',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      category: 'HTML 元素',
      schema: {
        props: {
          data: [
            {
              key: '1',
              name: 'John Brown',
              age: 32,
              address: 'New York No. 1 Lake Park',
              tags: ['nice', 'developer'],
            },
          ],
          columns: [
            {
              title: 'Name',
              dataIndex: 'name',
              key: 'name',
            },
          ],
        },
        children: ['I am a Div Table'],
      },
    },
  ],
};
