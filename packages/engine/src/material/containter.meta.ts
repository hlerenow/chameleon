import { CMaterialPropsType } from '@chamn/model';

export const containerProps: CMaterialPropsType<'FastLayoutSetter'> = [
  {
    name: 'style',
    title: '布局',
    valueType: 'string',
    setters: [
      {
        componentName: 'ShapeSetter',
        initialValue: {},
        props: {
          collapse: {
            open: true,
          },
          elements: [
            {
              name: '',
              setters: [
                {
                  componentName: 'FastLayoutSetter',
                  hiddenLabel: true,
                },
              ],
              title: '',
              valueType: 'string',
            },
          ],
        },
      },
    ],
  },
];
