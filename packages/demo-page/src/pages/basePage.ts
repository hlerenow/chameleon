import { CPageDataType, InnerComponentNameEnum } from '@chameleon/model';
export const BasePage: CPageDataType = {
  version: '1.0.0',
  pageName: 'BaseDemoPage',
  componentsMeta: [],
  componentsTree: {
    componentName: InnerComponentNameEnum.PAGE,
    children: [
      {
        componentName: 'Button',
        children: ['123'],
      },
    ],
  },
};
