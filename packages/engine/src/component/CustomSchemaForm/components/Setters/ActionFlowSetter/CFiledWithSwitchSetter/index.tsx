import { useContext, useMemo, useState } from 'react';
import BUILD_IN_SETTER_MAP from '../..';
import { CField, CFieldProps } from '../../../Form/Field';
import { SetterObjType, SetterType } from '@chamn/model';
import { Dropdown, MenuProps } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import { CCustomSchemaFormContext } from '@/component/CustomSchemaForm/context';
import { getSetterList } from '@/component/CustomSchemaForm/utils';
import styles from './style.module.scss';

export const CFiledWithSwitchSetter = (
  props: Omit<CFieldProps, 'children'> & {
    setterList: SetterType[];
    onSetterChange?: (setterName: string) => void;
    defaultSetterName?: string;
  }
) => {
  const { setterList: setters, defaultSetterName, ...restProps } = props;

  const setterList = useMemo(() => {
    return getSetterList(setters);
  }, [setters]);

  const { onSetterChange, defaultSetterConfig, formRef, pluginCtx } = useContext(CCustomSchemaFormContext);
  const keyPaths = [props.name];

  const [currentSetter, setCurrentSetter] = useState<SetterObjType | null>(() => {
    const currentSetterName = defaultSetterConfig[keyPaths.join('.')]?.setter || defaultSetterName || '';
    return [...setterList].find((el) => el.componentName === currentSetterName) || setterList[0];
  });

  const CurrentSetterComp = useMemo(() => {
    return BUILD_IN_SETTER_MAP[currentSetter?.componentName as any];
  }, [currentSetter]);

  const menuItems = setterList.map((setter) => {
    const setterName = setter?.componentName || '';
    const setterRuntime = BUILD_IN_SETTER_MAP[setterName];
    return {
      key: setter.componentName,
      label: setterRuntime?.setterName || setter.componentName,
    };
  });

  const onChooseSetter: MenuProps['onClick'] = ({ key }) => {
    const targetSetter = setterList.find((setter) => setter.componentName === key);
    if (targetSetter) {
      setCurrentSetter(targetSetter);
      onSetterChange?.(keyPaths, targetSetter.componentName);
      props.onSetterChange?.(targetSetter.componentName);
    }
  };

  let switcher: any = (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className={styles.switchBtn}
    >
      <Dropdown
        trigger={['click']}
        menu={{
          selectable: true,
          items: menuItems,
          onClick: onChooseSetter,
          defaultSelectedKeys: [currentSetter?.componentName || ''],
        }}
      >
        <SwapOutlined />
      </Dropdown>
    </div>
  );

  if (menuItems.length === 1) {
    switcher = null;
  }

  const setterProps = useMemo(() => {
    let newProps = {
      ...(currentSetter?.props || {}),
      initialValue: currentSetter?.initialValue,
    };
    const target = setterList.find((el) => el.componentName === currentSetter?.componentName);
    if (target) {
      newProps = {
        ...newProps,
        ...target.props,
      };
    }
    return newProps;
  }, [setterList, currentSetter]);

  const setterContext = {
    formRef,
    pluginCtx,
  };

  return (
    <div
      className={styles.fieldBox}
      style={{
        alignItems: props.labelAlign ?? 'center',
      }}
    >
      <CField {...restProps}>
        <CurrentSetterComp
          {...setterProps}
          setterContext={{
            ...setterContext,
            keyPaths: [props.name],
            label: props.label,
          }}
        />
      </CField>
      {switcher}
    </div>
  );
};
