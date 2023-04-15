import { CMaterialType } from '@chamn/model';

export const ButtonMeta: CMaterialType = {
  title: 'Button',
  componentName: 'Button',
  npm: {
    package: 'antd',
    exportName: 'Button',
    destructuring: true,
    version: '1.0.0',
  },
  icon: 'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
  // 对 Button 属性的行为描述
  props: [
    {
      name: 'type',
      title: '按钮类型',
      valueType: 'string',
      // 用于配制用那些输入控件来接收 props 的值
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
      // 用于支持联动，当某些 key 的值变化后，控制当前属性是否显示的逻辑判断
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
      // 支持多种值的输入控件
      setters: ['StringSetter', 'ExpressionSetter'],
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
  // 组件 schema 片段，会被展示在组件库中
  snippets: [
    {
      title: '基础按钮',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      category: '基础控件2',
      // 当被拖入到画布上时会将对应的 schema 添加到 页面级别的 Schema 中, 如果 schema 没有componentName， 会默认添加当前组件的 componentName
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
