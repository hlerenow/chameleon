import { CMaterialType } from '@chamn/model';

export const LayoutMeta: CMaterialType = {
  title: 'CLayout',
  componentName: 'CLayout',
  npm: {
    package: '@chamn/mock-material',
    exportName: 'CLayout',
    version: '1.0.0',
    name: 'CLayout',
  },
  icon: 'Layout',
  disableEditorDragDom: {
    class: ['as44556', 'resize-handle'],
  },
  props: [
    {
      name: 'type',
      title: '按钮类型',
      valueType: 'string',
      setters: [
        {
          componentName: 'SelectSetter',
          props: {
            options: [
              {
                value: 'primary',
                label: 'primary',
              },
              {
                value: 'link',
                label: 'link',
              },
              {
                value: '',
                label: 'Default',
              },
            ],
          },
        },
      ],
    },
    {
      name: 'block',
      title: '块状按钮',
      valueType: 'boolean',
      setters: ['BooleanSetter'],
      condition: (state) => {
        if (state.type === 'primary') {
          return true;
        }
        return false;
      },
    },
    {
      name: 'children',
      title: '文本',
      valueType: 'string',
      setters: [
        {
          componentName: 'StringSetter',
          initialValue: '123',
        },
        'ExpressionSetter',
      ],
    },
    {
      name: 'onClick',
      title: '点击时',
      valueType: 'function',
      setters: ['FunctionSetter', 'ExpressionSetter'],
    },
    {
      name: 'text1',
      title: '联动文本1',
      valueType: 'string',
      setters: [
        {
          componentName: 'StringSetter',
        },
      ],
      condition: (state) => {
        if (state.type === 'primary1') {
          return true;
        }
        return false;
      },
    },
    {
      name: 'text2',
      title: '联动文本2',
      valueType: 'string',
      setters: [
        {
          componentName: 'StringSetter',
        },
      ],
      condition: (state) => {
        if (state.text1 === '1') {
          return true;
        }
        return false;
      },
    },
    {
      name: 'text3',
      title: '联动文本3',
      valueType: 'string',
      setters: [
        {
          componentName: 'StringSetter',
        },
        'ExpressionSetter',
      ],
    },
  ],
  snippets: [
    {
      title: '基础布局',
      description: '自定义延迟插入 Button, 不能被选中, 不能拖拽',
      snapshotText: 'Layout',
      schema: {
        props: {
          type: 'primary',
        },
        children: ['I am a Button'],
      },
    },
  ],
};
