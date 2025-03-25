import { AdvanceCustom, CMaterialType } from '@chamn/model';
import { snippets } from './snippets';
import { basicCategory, groupName } from '../config';
import { componentName } from './config';

const advanceCustomForFragmentEditor: AdvanceCustom = {
  canAcceptNode: async (node, params) => {
    return false;
  },
  dropPlaceholder: () => {
    return (
      <div
        style={{
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(200, 200, 200, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: 2,
          fontSize: 14,
          color: 'gray',
          cursor: 'default',
          minHeight: 50,
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        Fragment 预留插槽
      </div>
    );
  },
};

export const CFragmentSlotMeta: CMaterialType<'SwitchContainerSetter'> = {
  componentName: componentName,
  title: '片段插槽',
  groupName,
  isContainer: true,
  props: [
    {
      title: '插槽唯一标识',
      valueType: 'string',
      name: 'slotId',
      setters: ['StringSetter'],
    },
  ],
  category: basicCategory,
  snippets: snippets,
  advanceCustom: {},
  npm: {
    name: componentName,
    package: '',
    version: __PACKAGE_VERSION__,
    destructuring: true,
    exportName: componentName,
  },
  extra: {
    advanceCustom: advanceCustomForFragmentEditor,
  },
};

export default [];
