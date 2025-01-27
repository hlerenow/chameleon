import React, { useContext, useMemo, useState } from 'react';
import { SetterObjType } from '@chamn/model';
import InnerSetters from '../Setters/index';
import { CField, CFieldProps } from '../Form/Field';
import { Collapse, Dropdown, MenuProps } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import styles from './style.module.scss';
import { CCustomSchemaFormContext } from '../../context';
import { CFormContext } from '../Form/context';
import { CSetter } from '../Setters/type';
import { SetterSwitcherCore } from './core';
import BUILD_IN_SETTER_MAP from '../Setters';

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

export const SetterSwitcher = ({ setters, keyPaths, condition, useField = true, ...props }: SetterSwitcherProps) => {
  const [visible, setVisible] = useState(true);
  const { customSetterMap } = useContext(CFormContext);
  const { onSetterChange, defaultSetterConfig, formRef, pluginCtx } = useContext(CCustomSchemaFormContext);
  const allSetterMap = {
    ...InnerSetters,
    ...customSetterMap,
  };
  const [currentSetter, setCurrentSetter] = useState<SetterObjType>(() => {
    const currentSetterName = defaultSetterConfig[keyPaths.join('.')]?.setter || '';
    const devConfigSetter = setters.find((el) => el.componentName === currentSetterName);
    return devConfigSetter || setters[0];
  });

  const menuItems = setters.map((setter) => {
    const setterName = setter?.componentName || '';
    const setterRuntime = allSetterMap[setterName];
    return {
      key: setter.componentName,
      label: setterRuntime?.setterName || setter.componentName,
    };
  });

  const switcher = useMemo(() => {
    const onChooseSetter: MenuProps['onClick'] = ({ key }) => {
      const targetSetter = setters.find((setter) => setter.componentName === key);
      if (targetSetter) {
        setCurrentSetter(targetSetter);
        onSetterChange?.(keyPaths, targetSetter.componentName);
      }
    };
    if (menuItems.length === 1) {
      return null;
    }

    return (
      <div
        className={styles.switchBtn}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
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
  }, [menuItems, currentSetter?.componentName, setters, onSetterChange, keyPaths]);

  const setterProps = useMemo(() => {
    let newProps = {
      ...(currentSetter?.props || {}),
      initialValue: currentSetter?.initialValue,
    };
    const target = setters.find((el) => el.componentName === currentSetter?.componentName);
    if (target) {
      newProps = {
        ...newProps,
        ...target.props,
      };
    }
    return newProps;
  }, [setters, currentSetter]);

  const [collapseHeaderExt, setCollapseHeaderExt] = useState<any>([]);

  let bodyView: any = null;
  const hiddenLabel = currentSetter?.hiddenLabel === true;
  const labelWidth = currentSetter?.labelWidth;
  const labelAlign = currentSetter?.labelAlign || 'center';
  const collapse = (currentSetter?.props as any)?.collapse;
  const specialSetter = ['ArraySetter', 'ShapeSetter'].includes(currentSetter.componentName);
  const setterContext = useMemo(
    () => ({
      formRef,
      pluginCtx,
      keyPaths: [...keyPaths],
      label: props.label,
      setCollapseHeaderExt: specialSetter ? setCollapseHeaderExt : undefined,
    }),
    [formRef, keyPaths, pluginCtx, props.label, specialSetter]
  );

  const filedView = useMemo(() => {
    const customSetterMap = {
      ...BUILD_IN_SETTER_MAP,
      ...(props.customSetterMap || {}),
    };

    const cFiledProps = {
      labelWidth,
      labelAlign,
      hiddenLabel,
      condition,
      noStyle: specialSetter ? true : false,
      onConditionValueChange: (val: boolean) => {
        setVisible(val);
      },
    };

    if (useField === false) {
      return (
        <SetterSwitcherCore
          setters={setters}
          keyPaths={keyPaths}
          currentSetter={currentSetter}
          setCurrentSetter={setCurrentSetter}
          {...props}
          {...setterProps}
          customSetterMap={customSetterMap}
          setterContext={setterContext}
        />
      );
    }
    return (
      <CField {...cFiledProps} {...props}>
        <SetterSwitcherCore
          setters={setters}
          keyPaths={keyPaths}
          currentSetter={currentSetter}
          setCurrentSetter={setCurrentSetter}
          {...setterProps}
          customSetterMap={customSetterMap}
          setterContext={setterContext}
        />
      </CField>
    );
  }, [
    condition,
    currentSetter,
    hiddenLabel,
    keyPaths,
    labelAlign,
    labelWidth,
    props,
    setterContext,
    setterProps,
    setters,
    specialSetter,
    useField,
  ]);

  const renderCollapse = useMemo(
    function renderCollapse() {
      const collapseObj = typeof collapse === 'object' ? collapse : {};

      const CollapseComponent = (extraHeaderContent?: React.ReactNode) => (
        <Collapse
          bordered={false}
          {...collapseObj}
          style={{
            marginBottom: '10px',
            flex: 1,
          }}
          defaultActiveKey={[collapseObj.open ? props.name : '']}
          items={[
            {
              key: props.name,
              label: (
                <div className={styles.collapseHeader}>
                  <span style={{ flex: 1 }}>{props.label}</span>
                  {extraHeaderContent}
                  {switcher}
                </div>
              ),
              children: filedView,
            },
          ]}
        />
      );

      return CollapseComponent;
    },
    [collapse, props.name, props.label, switcher, filedView]
  );

  if (['ArraySetter'].includes(currentSetter?.componentName || '')) {
    bodyView = renderCollapse(collapseHeaderExt);
  } else if (['ShapeSetter'].includes(currentSetter?.componentName || '')) {
    bodyView = (
      <div className={styles.shapeFieldBox}>
        {props.prefix ?? null}
        {(currentSetter?.props as any)?.collapse === false && <div style={{ width: '100%' }}>{filedView}</div>}
        {collapse !== false && renderCollapse()}
        {props.suffix ?? null}
      </div>
    );
  } else {
    bodyView = (
      <div style={{ display: 'flex', alignItems: labelAlign, paddingBottom: '8px' }}>
        {props.prefix ?? null}
        {filedView}
        {switcher}
        {props.suffix ?? null}
      </div>
    );
  }

  return <div style={{ display: visible ? 'block' : 'none', overflow: 'auto' }}>{bodyView}</div>;
};
