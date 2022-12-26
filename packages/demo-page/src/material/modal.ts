import { CMaterialType } from '@chameleon/model';

export const DivMeta: CMaterialType = {
  title: 'Modal',
  componentName: 'Modal',
  npm: {
    package: '@chameleon/mock-material',
    exportName: 'Modal',
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
      title: '基础元素',
      snapshot:
        'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
      category: 'HTML 元素',
      schema: {
        props: {},
        children: ['I am a Div tag'],
      },
    },
  ],
};
