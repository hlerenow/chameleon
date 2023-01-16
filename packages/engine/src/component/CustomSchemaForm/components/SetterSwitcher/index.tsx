import React, { useState } from 'react';
import { SetterObjType } from '@chameleon/model';
import Setters from '../Setters/index';
import { CField, CFieldProps } from '../Form/Field';
import { Collapse, Dropdown, MenuProps } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
import styles from './style.module.scss';

export type SetterSwitcherProps = {
  setters: SetterObjType[];
  keyPaths: string[];
  currentSetterName?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  style?: React.CSSProperties;
} & Omit<CFieldProps, 'children'>;

export const SetterSwitcher = ({
  setters,
  currentSetterName,
  keyPaths,
  condition,
  style = {},
  ...props
}: SetterSwitcherProps) => {
  console.log('🚀 ~ file: index.tsx:24 ~ condition', condition);
  const [visible, setVisible] = useState(true);
  const [currentSetter, setCurrentSetter] = useState<SetterObjType | null>(
    () => {
      return (
        setters.find((el) => el.componentName === currentSetterName) ||
        setters[0]
      );
    }
  );
  console.log('直接 返回 111');

  if (!visible) {
    console.log('直接 返回');
    return null;
  }
  let CurrentSetterComp = null;
  if (currentSetter?.componentName) {
    CurrentSetterComp = (Setters as any)[currentSetter?.componentName];
  }

  if (!CurrentSetterComp) {
    CurrentSetterComp = () =>
      (
        <div
          style={{
            backgroundColor: 'pink',
            margin: '5px 0',
            padding: '5px',
            borderRadius: '2px',
          }}
        >{`${currentSetter?.componentName} ins not found.`}</div>
      ) as any;
  }

  const menuItems = setters.map((setter) => {
    const setterName = setter?.componentName || '';
    const setterRuntime = Setters[setterName];
    return {
      key: setter.componentName,
      label: setterRuntime?.setterName || setter.componentName,
    };
  });

  const onClick: MenuProps['onClick'] = ({ key }) => {
    const targetSetter = setters.find((setter) => setter.componentName === key);
    if (targetSetter) {
      setCurrentSetter(targetSetter);
    }
    console.info(`Click on item ${key}`);
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
          items: menuItems,
          onClick,
        }}
      >
        <SwapOutlined />
      </Dropdown>
    </div>
  );

  if (menuItems.length === 1) {
    switcher = null;
  }

  const setterProps = currentSetter?.props || {};
  const [collapseHeaderExt, setCollapseHeaderExt] = useState<any>([]);
  let bodyView: any = null;
  if (['ArraySetter'].includes(currentSetter?.componentName || '')) {
    bodyView = (
      <Collapse bordered={false} defaultActiveKey={[props.name]}>
        <Collapse.Panel
          header={
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
          }
          key={props.name}
        >
          <CField {...props} noStyle condition={condition}>
            <CurrentSetterComp
              {...setterProps}
              keyPaths={[...keyPaths]}
              setCollapseHeaderExt={setCollapseHeaderExt}
            />
          </CField>
        </Collapse.Panel>
      </Collapse>
    );
  } else if (['ShapeSetter'].includes(currentSetter?.componentName || '')) {
    bodyView = (
      <div className={styles.shapeFieldBox}>
        {props.prefix ?? null}
        <Collapse
          bordered={false}
          defaultActiveKey={[props.name]}
          style={{ flex: 1, marginTop: '-5px' }}
        >
          <Collapse.Panel
            header={
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
            }
            key={props.name}
          >
            <CField
              {...props}
              noStyle
              condition={condition}
              onConditionValueChange={(val) => {
                console.log('🚀 ~ file: index.tsx:172 ~ val', val);
                setVisible(val);
              }}
            >
              <CurrentSetterComp {...setterProps} keyPaths={[...keyPaths]} />
            </CField>
          </Collapse.Panel>
        </Collapse>
        {props.suffix ?? null}
      </div>
    );
  } else {
    bodyView = (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {props.prefix ?? null}
        <CField {...props} condition={condition}>
          <CurrentSetterComp keyPaths={[...keyPaths]} {...setterProps} />
        </CField>
        {switcher}
        {props.suffix ?? null}
      </div>
    );
  }

  return <div style={{ marginBottom: '15px' }}>{bodyView}</div>;
};
