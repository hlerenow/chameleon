import { CMaterialType } from '@chamn/model';
import { snippets } from './snippets';
import { componentName } from './config';
import { basicCategory, groupName } from '../config';

export const CLoadLayoutBoxMeta: CMaterialType = {
  componentName: componentName,
  title: '片段插槽Box',
  groupName,
  isContainer: true,
  props: [],
  category: basicCategory,
  advanceCustom: {
    onDelete: async () => {
      return false;
    },
  },
  npm: {
    name: componentName,
    package: '11',
    version: __PACKAGE_VERSION__,
    destructuring: true,
    exportName: componentName,
  },
  snippets: snippets,
};

export default [CLoadLayoutBoxMeta];
