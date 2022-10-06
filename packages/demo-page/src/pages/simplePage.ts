import { CPageDataType, InnerComponentNameEnum } from '@chameleon/model';

export const SamplePage: CPageDataType = {
  version: '1.0.0',
  pageName: 'BaseDemoPage',
  componentsMeta: [],
  componentsTree: {
    id: '1',
    componentName: InnerComponentNameEnum.PAGE,
    props: {
      a: 1,
    },
    children: [
      {
        id: 'Modal',
        componentName: 'Modal',
        props: {
          open: false,
        },
      },
      {
        id: '2',
        componentName: 'Button',
        props: {
          type: 'primary',
        },
        children: ['123'],
      },
    ],
  },
};
