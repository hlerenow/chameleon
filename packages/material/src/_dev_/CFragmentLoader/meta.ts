import { CMaterialType } from '@chamn/model';
import { basicCategory, groupName, componentName } from './config';
import { cFragmentMeta } from '../CFragment/meta';

export const componentMeta: CMaterialType = {
  componentName: componentName,
  title: 'Fragment',
  groupName,
  isContainer: true,
  props: cFragmentMeta.props as any,
  category: basicCategory,
  npm: {
    name: componentName,
    package: '111',
    version: __PACKAGE_VERSION__,
    destructuring: true,
    exportName: componentName,
  },
  advanceCustom: cFragmentMeta.advanceCustom,
  snippets: [
    {
      title: 'fragment FP1',
      snapshotText: 'FP1',
      schema: {
        componentName: 'CFragmentLoader',
        props: {
          fid: 1,
          prjId: 4,
        },
        injectEnvList: ['COMPONENTS'],
      },
    },
  ],
};

export default [componentMeta];
