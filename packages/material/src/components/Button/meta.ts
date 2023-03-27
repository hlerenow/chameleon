import { CMaterialType } from '@chamn/model';
import { snippets } from './snippets';

export const meta: CMaterialType = {
  componentName: 'Button',
  title: '按钮',
  props: [],
  npm: {
    package: '@chamn/material',
    version: '0.0.1',
    destructuring: true,
    exportName: 'Button',
  },
  snippets: snippets,
};
