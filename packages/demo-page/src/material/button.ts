import { CMaterialType } from '@chameleon/model';

export const ButtonMeta: CMaterialType = {
  title: 'Button',
  componentName: 'Button',
  npm: {
    package: '@chameleon/mock-material',
    exportName: 'Button',
    version: '1.0.0',
  },
  icon: 'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
  props: [
    {
      name: 'type',
      title: '按钮类型',
      valueType: 'string',
      setters: [
        {
          componentName: 'StringSetter',
        },
      ],
    },
    {
      name: 'text1',
      title: '文本1',
      valueType: 'string',
      setters: [
        {
          componentName: 'StringSetter',
        },
      ],
      condition: (state) => {
        console.log(11111, state);
        if (state.type === 'primary1') {
          return true;
        }
        return false;
      },
    },
    {
      name: 'text2',
      title: '文本2',
      valueType: 'string',
      setters: [
        {
          componentName: 'StringSetter',
        },
      ],
      condition: (state) => {
        console.log(222, state);
        if (state.text1 === '1') {
          return true;
        }
        return false;
      },
    },
    {
      name: 'text3',
      title: '文本3',
      valueType: 'string',
      setters: [
        {
          componentName: 'StringSetter',
        },
      ],
    },
    {
      name: 'children',
      title: '文本',
      valueType: 'string',
      setters: ['StringSetter'],
    },
  ],
  snippets: [
    {
      title: '基础按钮',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      description:
        '我是 antd 的 Button 组件,我是 antd 的 Button 组件,我是 antd 的 Button 组件,我是 antd 的 Button 组件,我是 antd 的 Button 组件,我是 antd 的 Button 组件,我是 antd 的 Button 组件,我是 antd 的 Button 组件,我是 antd 的 Button 组件',
      schema: {
        props: {
          type: 'primary',
        },
        children: ['I am a Button'],
      },
    },
    {
      title: '基础按钮',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      category: '基础控件',
      schema: {
        props: {
          type: 'primary',
        },
        children: ['I am a Button'],
      },
    },
    {
      title: '基础按钮',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      category: '基础控件',
      schema: {
        props: {
          type: 'primary',
        },
        children: ['I am a Button'],
      },
    },
    {
      title: '基础按钮',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      category: '基础控件1',
      schema: {
        props: {
          type: 'primary',
        },
        children: ['I am a Button'],
      },
    },
    {
      title: '基础按钮',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      category: '基础控件2',
      schema: {
        props: {
          type: 'primary',
        },
        children: ['I am a Button'],
      },
    },
    {
      title: '基础按钮',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      category: '基础控件3',
      schema: {
        props: {
          type: 'primary',
        },
        children: ['I am a Button'],
      },
    },
    {
      title: '基础按钮',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      category: '基础控件4',
      schema: {
        props: {
          type: 'primary',
        },
        children: ['I am a Button'],
      },
    },
  ],
};
