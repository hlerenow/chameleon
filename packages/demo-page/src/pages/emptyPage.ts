import { CPageDataType, InnerComponentNameEnum } from '@chamn/model';

export const EmptyPage: CPageDataType = {
  version: '1.0.0',
  name: 'EmptyPage',
  componentsMeta: [],
  componentsTree: {
    componentName: InnerComponentNameEnum.ROOT_CONTAINER,
    props: {},
    children: [],
  },
};
