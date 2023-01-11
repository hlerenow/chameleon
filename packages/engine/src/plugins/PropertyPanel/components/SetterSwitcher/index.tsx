import React, { useState } from 'react';
import { SetterObjType } from '@chameleon/model';
import * as Setters from '../Setters/index';
import { CField, CFieldProps } from '../Form/Field';
import { Collapse, Dropdown, MenuProps } from 'antd';
import { MenuOutlined } from '@ant-design/icons';

export type SetterSwitcherProps = {
  setters: SetterObjType[];
  keyPath: string[];
  currentSetterName?: string;
} & Omit<CFieldProps, 'children'>;

export const SetterSwitcher = ({
  setters,
  currentSetterName,
  ...props
}: SetterSwitcherProps) => {
  const [currentSetter, setCurrentSetter] = useState<SetterObjType | null>(
    () => {
      return (
        setters.find((el) => el.componentName === currentSetterName) ||
        setters[0]
      );
    }
  );

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
    return {
      key: setter.componentName,
      label: setter.componentName,
    };
  });

  const onClick: MenuProps['onClick'] = ({ key }) => {
    const targetSetter = setters.find((setter) => setter.componentName === key);
    console.log('🚀 ~ file: index.tsx:53 ~ targetSetter', targetSetter);
    if (targetSetter) {
      setCurrentSetter(targetSetter);
    }
    console.info(`Click on item ${key}`);
  };

  const switcher = (
    <div
      style={{
        padding: '5px 5px 0 13px',
      }}
    >
      <Dropdown
        menu={{
          items: menuItems,
          onClick,
        }}
      >
        <MenuOutlined />
      </Dropdown>
    </div>
  );

  const setterProps = currentSetter?.props || {};
  if (['ArraySetter'].includes(currentSetter?.componentName || '')) {
    return (
      <Collapse bordered={false} defaultActiveKey={[props.name]}>
        <Collapse.Panel
          header={
            <div style={{ display: 'flex' }}>
              <span
                style={{
                  flex: 1,
                }}
              >
                {props.name}
              </span>
              {switcher}
            </div>
          }
          key={props.name}
        >
          <CField {...props} noStyle>
            <CurrentSetterComp {...setterProps} />
          </CField>
        </Collapse.Panel>
      </Collapse>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <CField {...props}>
        <CurrentSetterComp />
      </CField>
      {switcher}
    </div>
  );
};
