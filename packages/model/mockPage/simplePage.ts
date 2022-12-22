export const SamplePage = {
  version: '1.0.0',
  pageName: 'BaseDemoPage',
  componentsMeta: [],
  componentsTree: {
    id: '1',
    componentName: 'Page',
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
