import { CMaterialType } from '@chamn/model';
import React from 'react';

export const ButtonMeta: CMaterialType = {
  title: 'Button',
  componentName: 'Button',
  npm: {
    package: '@chamn/mock-material',
    exportName: 'Button',
    version: '1.0.0',
    name: 'Button',
  },
  icon: 'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
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
  advanceCustom: {
    onCopy: async () => {
      console.log('onCopy');
    },
    selectRectViewRender: (props) => {
      console.log(123, props);
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          123
        </div>
      );
    },
    hoverRectViewRender: () => {
      return <>Hover</>;
    },
    dropViewRender: (props) => {
      console.log('123213', props);
      return <>drop 11111</>;
    },
    ghostViewRender: () => {
      return <>Big Button</>;
    },
    toolbarViewRender: () => {
      return <>toolbar</>;
    },
    canDragNode: async (node, params) => {
      console.log('canDragNode', node, params);
      if (params.event?.extraData?.type === 'NEW_ADD') {
        return true;
      }
      return true;
    },
    onDragging: async () => {
      console.log('onDragging');
    },
    onDrop: async () => {
      console.log('onDrop');
      return true;
    },
    onSelect: async () => {
      console.log('onSelect');
      return true;
    },
    onDelete: async () => {
      console.log('onDelete');
      return true;
    },
    onNewAdd: async (node, params) => {
      params.viewPortal.setView(<div>123</div>);
      console.log('onNewAdd');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
          params.viewPortal.clearView();
        }, 1000);
      });
    },
  },
  snippets: [
    {
      title: '基础按钮',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      description: '自定义延迟插入 Button, 不能被选中, 不能拖拽',
      schema: {
        props: {
          type: 'primary',
        },
        children: ['I am a Button'],
      },
    },
  ],
};
