import React, { useContext, useEffect } from 'react';
import { SetterObjType } from '@chamn/model';
import InnerSetters from '../Setters/index';
import { CFieldProps } from '../Form/Field';
import { CCustomSchemaFormContext } from '../../context';
import { CFormContext } from '../Form/context';
import { CSetter, CSetterProps } from '../Setters/type';
import { getDefaultSetterByValue } from '../../utils';

export type SetterSwitcherProps = {
  // 支持的 setter 列表
  setters: SetterObjType[];
  // 自定义 setter 的具体实现，可以覆盖默认 setter
  customSetterMap?: Record<string, CSetter>;
  keyPaths: string[];
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  style?: React.CSSProperties;
  /** 是否实用 CFile 包裹 */
  useField?: boolean;
} & Omit<CFieldProps, 'children'>;

/** 用于渲染切换设置器 */
export const SetterSwitcherCore = ({
  setters,
  keyPaths,
  currentSetter,
  setCurrentSetter,
  customSetterMap: customSetterMapProp,
  ...props
}: Pick<SetterSwitcherProps, 'setters' | 'keyPaths'> & {
  value?: any;
  setterContext?: Partial<CSetterProps['setterContext']>;
  currentSetter: SetterObjType;
  customSetterMap?: any;
  setCurrentSetter: (setter: SetterObjType) => void;
}) => {
  const { customSetterMap } = useContext(CFormContext);
  const { defaultSetterConfig } = useContext(CCustomSchemaFormContext);
  const allSetterMap = {
    ...InnerSetters,
    ...(customSetterMapProp || {}),
    ...customSetterMap,
  };

  useEffect(() => {
    const currentSetterName = defaultSetterConfig[keyPaths.join('.')]?.setter || '';
    const devConfigSetter = setters.find((el) => el.componentName === currentSetterName);
    const st = devConfigSetter || getDefaultSetterByValue(props.value, setters) || setters[0];
    setCurrentSetter(st);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let CurrentSetterComp = null;
  if (currentSetter?.componentName) {
    CurrentSetterComp = allSetterMap[currentSetter?.componentName] || currentSetter.component;
  }
  if (!CurrentSetterComp) {
    CurrentSetterComp = function EmptySetter() {
      return (
        <div
          style={{
            backgroundColor: 'whitesmoke',
            margin: '5px 0',
            padding: '5px',
            borderRadius: '2px',
            color: 'gray',
          }}
        >{`${currentSetter?.componentName} is not found.`}</div>
      );
    };
  }

  return <CurrentSetterComp {...props} />;
};
