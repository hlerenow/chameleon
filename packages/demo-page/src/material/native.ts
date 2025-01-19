import { CMaterialType } from '@chamn/model';

export const DivMeta: CMaterialType = {
  title: 'Div',
  componentName: 'div',
  icon: 'https://alifd.oss-cn-hangzhou.aliyuncs.com/fusion-cool/icons/icon-light/ic_light_button.png',
  props: [
    {
      name: 'style',
      title: '样式',
      valueType: 'object',
      setters: ['JSONSetter'],
    },
  ],
  methods: [
    {
      name: 'doAlert',
      params: [
        {
          name: 'msg',
        },
      ],
      title: '打开警告提示',
    },
    {
      name: 'doAlert2',
      params: [
        {
          name: 'msg',
          description: '警告内容',
          tsType: 'string',
          example: '请求失败',
        },
        {
          name: 'count',
          description: '提示次数',
          tsType: 'number',
          example: '1',
        },
      ],
      title: '打开警告提示2',
    },
  ],
  snippets: [
    {
      title: '基础元素',
      snapshotText: 'Div',
      category: 'HTML 元素',
      schema: {
        props: {},
        children: ['I am a Div tag'],
      },
    },
  ],
};
