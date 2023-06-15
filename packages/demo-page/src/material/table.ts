import { CMaterialType } from '@chamn/model';

export const TableMeta: CMaterialType = {
  title: 'Table',
  componentName: 'Table',
  npm: {
    name: 'MockMaterial',
    package: '@chamn/mock-material',
    exportName: 'Table',
    version: '1.0.0',
  },
  props: [
    {
      name: 'name',
      title: '表名',
      valueType: 'string',
      setters: [
        'TextAreaSetter',
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
                'StringSetter',
                {
                  componentName: 'SelectSetter',
                  props: {
                    options: [
                      { value: 'jack', label: 'Jack' },
                      { value: 'lucy', label: 'Lucy' },
                      { value: 'Yiminghe', label: 'yiminghe' },
                      { value: 'disabled', label: 'Disabled', disabled: true },
                    ],
                  },
                },
                'JSONSetter',
                'FunctionSetter',
                'ComponentSetter',
              ],
              initialValue: '',
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
      name: 'selectSetter',
      title: 'select',
      valueType: 'string',
      setters: [
        {
          componentName: 'SelectSetter',
          props: {
            options: [
              { value: 'jack', label: 'Jack' },
              { value: 'lucy', label: 'Lucy' },
              { value: 'Yiminghe', label: 'yiminghe' },
              { value: 'disabled', label: 'Disabled', disabled: true },
            ],
          },
        },
      ],
    },
    {
      name: 'testArrayString',
      title: '数组字符串',
      valueType: 'array',
      setters: [
        {
          componentName: 'ArraySetter',
          props: {
            item: {
              setters: [
                'StringSetter',
                'SelectSetter',
                'JSONSetter',
                'FunctionSetter',
                'ComponentSetter',
              ],
              initialValue: '',
            },
          },
          initialValue: [],
        },
        {
          componentName: 'ExpressionSetter',
          initialValue: [],
        },
        'StringSetter',
        'SelectSetter',
        'JSONSetter',
        'FunctionSetter',
        'ComponentSetter',
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
                        name: 'title',
                        title: '列名',
                        valueType: 'string',
                        setters: ['StringSetter', 'NumberSetter'],
                      },
                      {
                        name: 'dataIndex',
                        title: 'dataIndex',
                        valueType: 'string',
                        setters: ['StringSetter'],
                      },
                      {
                        name: 'render',
                        title: '渲染组件',
                        valueType: 'component',
                        setters: ['ComponentSetter'],
                      },
                      {
                        name: 'filteredValue',
                        title: '过滤值',
                        valueType: 'array',
                        setters: ['StringSetter'],
                        condition: (state: any) => {
                          if (state.dataIndex === '1') {
                            return true;
                          }
                          return false;
                        },
                      },
                    ],
                  },
                  initialValue: {},
                },
                'StringSetter',
                'SelectSetter',
                'JSONSetter',
                'FunctionSetter',
                'ComponentSetter',
              ],
              initialValue: {
                title: 'Name',
                dataIndex: 'Name',
                filteredValue: '123',
              },
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
      snapshotText: 'Table',
      category: '高级组件',
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
