import { CMaterialType } from '@chamn/model';
import { snippets } from './snippets';
import { componentName } from './config';
import { Switch, SwitchProps, message } from 'antd';

export const ButtonMeta: CMaterialType<'SwitchContainerSetter'> = {
  componentName: componentName,
  title: '跳转链接',
  groupName: '',
  props: [
    {
      title: '跳转 url ',
      valueType: 'string',
      name: 'url',
      setters: ['TextAreaSetter', 'CBLinkSetter' as any],
    },
    {
      title: '容器',
      valueType: 'string',
      name: 'content',
      setters: [
        {
          componentName: 'SwitchContainerSetter',
          component: (props) => {
            const onChange: SwitchProps['onChange'] = (checked) => {
              const currentNode =
                props.setterContext.pluginCtx.engine.getActiveNode();
              currentNode.value.configure.isContainer = checked;
              if (!checked) {
                currentNode.value.children = [];
              }
              currentNode.updateValue();
            };
            return <Switch size="default" onChange={onChange} />;
          },
        },
      ],
    },
  ],
  category: '',
  advanceCustom: {
    onSelect: async (node, ctx) => {
      return true;
    },
    wrapComponent: (targetComponent, options) => {
      const OriginalComp = targetComponent;
      return (props) => {
        return (
          <OriginalComp
            {...props}
            designerOption={options}
            isDesigner={true}
            onJump={(url: string) => {
              message.warning(`设计模式不能跳转: [${url}]`);
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

export default [ButtonMeta];
