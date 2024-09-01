import { CPageDataType } from '@chamn/model';

export const EmptyPage: CPageDataType = {
  version: '1.0.0',
  name: 'BaseDemoPage',
  componentsMeta: [
    {
      componentName: 'GridItem',
      name: 'GridItem',
      package: '@chamn/material',
      version: '0.0.46',
      destructuring: true,
      exportName: 'GridItem',
    },
    {
      componentName: 'GridItem',
      name: 'GridItem',
      package: '@chamn/material',
      version: '0.0.46',
      destructuring: true,
      exportName: 'GridItem',
    },
    {
      componentName: 'GridItem',
      name: 'GridItem',
      package: '@chamn/material',
      version: '0.0.46',
      destructuring: true,
      exportName: 'GridItem',
    },
    {
      componentName: 'GridItem',
      name: 'GridItem',
      package: '@chamn/material',
      version: '0.0.46',
      destructuring: true,
      exportName: 'GridItem',
    },
    {
      componentName: 'GridLayout',
      name: 'GridLayout',
      package: '@chamn/material',
      version: '0.0.46',
      destructuring: true,
      exportName: 'GridLayout',
    },
  ],
  componentsTree: {
    componentName: 'RootContainer',
    props: {
      a: 1,
    },
    state: {
      b: 2,
      buttonVisible: true,
      modalVisible: false,
    },
    configure: {
      propsSetter: {},
      advanceSetter: {},
    },
    children: [
      {
        props: {
          breakpoints: [
            {
              w: 350,
              label: 'mobile',
            },
            {
              w: 768,
              label: 'xs',
            },
            {
              w: 992,
              label: 'sm',
            },
            {
              w: 1200,
              label: 'md',
            },
            {
              w: 1920,
              label: 'lg',
            },
            {
              w: 3600,
              label: 'xl',
            },
          ],
        },
        componentName: 'GridLayout',
        id: 'hps09b',
        children: [
          {
            props: {
              responsive: [
                {
                  label: 'lg',
                  info: {
                    x: 0,
                    y: 11,
                    w: 14,
                    h: 3,
                  },
                  x: '',
                  y: '',
                },
                {
                  label: 'md',
                  info: {
                    x: 0,
                    y: 4,
                    w: 24,
                    h: 2,
                  },
                  x: '',
                  y: '',
                },
                {
                  label: 'xs',
                  info: {
                    x: 6,
                    y: 7,
                    w: 14,
                    h: 3,
                  },
                },
                {
                  label: 'sm',
                  info: {
                    x: 0,
                    y: 11,
                    w: 14,
                    h: 3,
                  },
                },
                {
                  label: 'mobile',
                  info: {
                    x: 5,
                    y: 7,
                    w: 14,
                    h: 3,
                  },
                },
              ],
            },
            componentName: 'GridItem',
            id: 'vnuvg0',
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
            style: [
              {
                property: 'background-color',
                value: 'rgb(139,187,17)',
              },
              {
                property: 'background-image',
                value: '',
              },
              {
                property: 'background-size',
                value: '',
              },
              {
                property: 'background-repeat',
                value: '',
              },
            ],
          },
          {
            props: {
              responsive: [
                {
                  label: 'lg',
                  info: {
                    x: 9,
                    y: 7,
                    w: 15,
                    h: 4,
                  },
                  x: '',
                  y: '',
                },
                {
                  label: 'md',
                  info: {
                    x: 9,
                    y: 6,
                    w: 15,
                    h: 3,
                  },
                  x: '',
                  y: '',
                },
                {
                  label: 'xs',
                  info: {
                    x: 5,
                    y: 5,
                    w: 16,
                    h: 2,
                  },
                },
                {
                  label: 'sm',
                  info: {
                    x: 9,
                    y: 7,
                    w: 15,
                    h: 4,
                  },
                },
                {
                  label: 'mobile',
                  info: {
                    x: 5,
                    y: 5,
                    w: 14,
                    h: 2,
                  },
                },
              ],
            },
            componentName: 'GridItem',
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
            id: 'pl20rg',
            style: [
              {
                property: 'background-color',
                value: 'rgb(250,140,22)',
              },
              {
                property: 'background-image',
                value: '',
              },
              {
                property: 'background-size',
                value: '',
              },
              {
                property: 'background-repeat',
                value: '',
              },
            ],
          },
          {
            props: {
              responsive: [
                {
                  label: 'lg',
                  info: {
                    x: 0,
                    y: 5,
                    w: 13,
                    h: 2,
                  },
                  x: '',
                  y: '',
                },
                {
                  label: 'md',
                  info: {
                    x: 0,
                    y: 9,
                    w: 13,
                    h: 5,
                  },
                  x: '',
                  y: '',
                },
                {
                  label: 'xs',
                  info: {
                    x: 4,
                    y: 3,
                    w: 18,
                    h: 2,
                  },
                },
                {
                  label: 'sm',
                  info: {
                    x: 0,
                    y: 5,
                    w: 13,
                    h: 2,
                  },
                },
                {
                  label: 'mobile',
                  info: {
                    x: 4,
                    y: 3,
                    w: 16,
                    h: 2,
                  },
                },
              ],
            },
            componentName: 'GridItem',
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
            id: 'b7l87q',
            style: [
              {
                property: 'background-color',
                value: 'rgb(114,46,209)',
              },
              {
                property: 'background-image',
                value: '',
              },
              {
                property: 'background-size',
                value: '',
              },
              {
                property: 'background-repeat',
                value: '',
              },
            ],
          },
          {
            props: {
              responsive: [
                {
                  label: 'lg',
                  info: {
                    x: 0,
                    y: 0,
                    w: 24,
                    h: 3,
                  },
                  x: '',
                  y: '',
                },
                {
                  label: 'md',
                  info: {
                    x: 0,
                    y: 0,
                    w: 24,
                    h: 2,
                  },
                  x: '',
                  y: '',
                },
                {
                  label: 'xs',
                  info: {
                    x: 0,
                    y: 0,
                    w: 24,
                    h: 3,
                  },
                },
                {
                  label: 'sm',
                  info: {
                    x: 0,
                    y: 0,
                    w: 24,
                    h: 3,
                  },
                },
                {
                  label: 'mobile',
                  info: {
                    x: 0,
                    y: 0,
                    w: 24,
                    h: 3,
                  },
                },
              ],
            },
            componentName: 'GridItem',
            configure: {
              propsSetter: {},
              advanceSetter: {},
            },
            id: 'egib67',
            style: [
              {
                property: 'background-color',
                value: 'rgb(245,34,45)',
              },
              {
                property: 'background-image',
                value: '',
              },
              {
                property: 'background-size',
                value: '',
              },
              {
                property: 'background-repeat',
                value: '',
              },
            ],
          },
        ],
        configure: {
          propsSetter: {},
          advanceSetter: {},
        },
      },
    ],
  },
  thirdLibs: [
    {
      package: 'dayjs',
      name: 'dayjs',
      version: '1.0.0',
    },
    {
      package: 'antd',
      name: 'antd',
      version: '1.0.0',
    },
  ],
  assets: [
    {
      package: '@chamn/material',
      globalName: 'ChamnCommonComponents',
      resources: [
        {
          src: 'https://cdn.jsdelivr.net/npm/@chamn/material/dist/index.js',
        },
        {
          src: 'https://cdn.jsdelivr.net/npm/@chamn/material/dist/style.css',
        },
      ],
    },
    {
      package: 'dayjs',
      globalName: 'dayjs',
      resources: [
        {
          src: 'https://cdn.bootcdn.net/ajax/libs/dayjs/1.11.9/dayjs.min.js',
        },
      ],
    },
  ],
};
