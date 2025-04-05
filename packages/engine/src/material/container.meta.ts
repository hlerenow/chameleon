import { CMaterialPropsType } from '@chamn/model';

export const containerProps: CMaterialPropsType<'FastLayoutSetter'> = [
  {
    name: 'style',
    title: '布局',
    valueType: 'string',
    setters: [
      {
        componentName: 'FastLayoutSetter',
        initialValue: {},
        hiddenLabel: true,
        props: {},
      },
    ],
  },
];
