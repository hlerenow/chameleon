import { CMaterialType } from '@chameleon/model';

export const InputMeta: CMaterialType = {
  title: 'Input',
  componentName: 'Input',
  npm: {
    package: '@chameleon/mock-material',
    exportName: 'Input',
    version: '1.0.0',
  },
  icon: 'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
  props: [
    {
      name: 'style',
      title: '样式',
      valueType: 'object',
      setters: ['JSONSetter'],
    },
  ],
  snippets: [
    {
      title: '输入框',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      category: 'HTML 元素',
      schema: {
        props: {},
      },
    },
  ],
};
