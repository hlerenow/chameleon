import { CPageDataType, InnerComponentNameEnum } from '@chameleon/model';

export const EmptyPage: CPageDataType = {
  version: '1.0.0',
  name: 'EmptyPage',
  componentsMeta: [],
  componentsTree: {
    componentName: InnerComponentNameEnum.PAGE,
    props: {},
    children: [],
  },
};
