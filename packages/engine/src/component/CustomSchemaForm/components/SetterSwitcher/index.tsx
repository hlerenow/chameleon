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

export type SetterSwitcherProps = {
  // 支持的 setter 列表
  setters: SetterObjType[];
  // 自定义 setter 的具体实现，可以覆盖默认 setter
  customSetterMap?: Record<string, CSetter>;
  keyPaths: string[];
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  style?: React.CSSProperties;
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
  const [currentSetter, setCurrentSetter] = useState<SetterObjType | null>(() => {
    const currentSetterName = defaultSetterConfig[keyPaths.join('.')]?.setter || '';
    return [...setters].find((el) => el.componentName === currentSetterName) || setters[0];
  });

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

  const menuItems = setters.map((setter) => {
    const setterName = setter?.componentName || '';
    const setterRuntime = allSetterMap[setterName];
    return {
      key: setter.componentName,
      label: setterRuntime?.setterName || setter.componentName,
    };
  });

  const onChooseSetter: MenuProps['onClick'] = ({ key }) => {
    const targetSetter = setters.find((setter) => setter.componentName === key);
    if (targetSetter) {
      setCurrentSetter(targetSetter);
      onSetterChange?.(keyPaths, targetSetter.componentName);
    }
  };

  let switcher: any = (
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

  if (menuItems.length === 1) {
    switcher = null;
  }
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
  }, [setters]);

  const setterContext = {
    formRef,
    pluginCtx,
  };

  const [collapseHeaderExt, setCollapseHeaderExt] = useState<any>([]);
  const conditionProps = {
    condition,
    onConditionValueChange: (val: boolean) => {
      setVisible(val);
    },
  };
  let bodyView: any = null;
  const hiddenLabel = useField === false || currentSetter?.hiddenLabel === true;
  if (['ArraySetter'].includes(currentSetter?.componentName || '')) {
    bodyView = (
      <Collapse
        bordered={false}
        style={{
          marginBottom: '10px',
        }}
        defaultActiveKey={[props.name]}
        items={[
          {
            label: (
              <div className={styles.collapseHeader}>
                <span
                  style={{
                    flex: 1,
                  }}
                >
                  {props.label}
                </span>
                {collapseHeaderExt}
                {switcher}
              </div>
            ),
            children: !hiddenLabel ? (
              <CField {...props} noStyle {...conditionProps}>
                <CurrentSetterComp
                  {...setterProps}
                  setterContext={{
                    ...setterContext,
                    keyPaths: [...keyPaths],
                    label: props.label,
                    setCollapseHeaderExt: setCollapseHeaderExt,
                  }}
                />
              </CField>
            ) : (
              <CurrentSetterComp
                {...setterProps}
                setterContext={{
                  ...setterContext,
                  keyPaths: [...keyPaths],
                  label: props.label,
                  setCollapseHeaderExt: setCollapseHeaderExt,
                }}
              />
            ),
          },
        ]}
      ></Collapse>
    );
  } else if (['ShapeSetter'].includes(currentSetter?.componentName || '')) {
    bodyView = (
      <div className={styles.shapeFieldBox}>
        {props.prefix ?? null}
        {(currentSetter?.props as any)?.collapse === false && (
          <div style={{ width: '100%' }}>
            {!hiddenLabel && (
              <CField {...props} noStyle {...conditionProps}>
                <CurrentSetterComp
                  {...setterProps}
                  setterContext={{
                    ...setterContext,
                    keyPaths: [...keyPaths],
                  }}
                />
              </CField>
            )}
            {hiddenLabel && (
              <CurrentSetterComp
                {...setterProps}
                setterContext={{
                  ...setterContext,
                  keyPaths: [...keyPaths],
                }}
              />
            )}
          </div>
        )}
        {(currentSetter?.props as any)?.collapse !== false && (
          <Collapse
            bordered={false}
            // defaultActiveKey={[props.name]}
            style={{ flex: 1 }}
            items={[
              {
                key: props.name,
                label: (
                  <div className={styles.collapseHeader}>
                    <span
                      style={{
                        flex: 1,
                      }}
                    >
                      {props.label}
                    </span>
                    {switcher}
                  </div>
                ),
                children: (
                  <CField {...props} noStyle {...conditionProps}>
                    <CurrentSetterComp
                      {...setterProps}
                      setterContext={{
                        ...setterContext,
                        keyPaths: [...keyPaths],
                      }}
                    />
                  </CField>
                ),
              },
            ]}
          ></Collapse>
        )}

        {props.suffix ?? null}
      </div>
    );
  } else {
    bodyView = (
      <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '8px' }}>
        {props.prefix ?? null}
        {!hiddenLabel && (
          <CField
            {...props}
            condition={condition}
            onConditionValueChange={(val) => {
              setVisible(val);
            }}
          >
            <CurrentSetterComp
              {...setterProps}
              setterContext={{
                ...setterContext,
                keyPaths: [...keyPaths],
              }}
            />
          </CField>
        )}
        {hiddenLabel && (
          <CurrentSetterComp
            {...setterProps}
            setterContext={{
              ...setterContext,
              keyPaths: [...keyPaths],
            }}
          />
        )}

        {switcher}
        {props.suffix ?? null}
      </div>
    );
  }

  return <div style={{ display: visible ? 'block' : 'none', overflow: 'auto' }}>{bodyView}</div>;
};
