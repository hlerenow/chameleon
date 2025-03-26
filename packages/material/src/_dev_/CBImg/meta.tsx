import { CMaterialType } from '@chamn/model';
import { snippets } from './snippets';
import { componentName } from './config';

export const ImgMeta: CMaterialType<'SwitchContainerSetter'> = {
  componentName: componentName,
  title: '图片',
  groupName: '',
  props: [
    {
      title: '地址 ',
      valueType: 'string',
      name: 'src',
      setters: ['TextAreaSetter', 'CBFileSetter' as any],
    },
  ],
  category: '',
  advanceCustom: {
    wrapComponent: (comp) => {
      return (props: any) => {
        const Comp = comp;
        return (
          <Comp
            {...props}
            style={{
              ...(props.style || {}),
              userSelect: 'none',
              WebkitUserDrag: 'none',
            }}
          />
        );
      };
    },
  },
  npm: {
    name: componentName,
    package: __PACKAGE_NAME__ || '',
    version: __PACKAGE_VERSION__,
    destructuring: true,
    exportName: componentName,
  },
  snippets: snippets,
};

export default [ImgMeta];
