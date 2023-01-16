import React, { useState } from 'react';
import { SetterObjType } from '@chameleon/model';
import Setters from '../Setters/index';
import { CField, CFieldProps } from '../Form/Field';
import { Collapse, Dropdown, MenuProps } from 'antd';
import { SwapOutlined } from '@ant-design/icons';

export type SetterSwitcherProps = {
  setters: SetterObjType[];
  keyPaths: string[];
  currentSetterName?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
} & Omit<CFieldProps, 'children'>;

export const SetterSwitcher = ({
  setters,
  currentSetterName,
  keyPaths,
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
      style={{
        padding: '5px 5px 0 13px',
      }}
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
                {props.label}
              </span>
              {switcher}
            </div>
          }
          key={props.name}
        >
          <CField {...props} noStyle>
            <CurrentSetterComp {...setterProps} keyPaths={[...keyPaths]} />
          </CField>
        </Collapse.Panel>
      </Collapse>
    );
  }

  if (['ShapeSetter'].includes(currentSetter?.componentName || '')) {
    return (
      <div style={{ display: 'flex' }}>
        {props.prefix ?? null}
        <Collapse
          bordered={false}
          defaultActiveKey={[props.name]}
          style={{ flex: 1 }}
        >
          <Collapse.Panel
            header={
              <div style={{ display: 'flex' }}>
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
            <CField {...props} noStyle>
              <CurrentSetterComp {...setterProps} keyPaths={[...keyPaths]} />
            </CField>
          </Collapse.Panel>
        </Collapse>
        {props.suffix ?? null}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {props.prefix ?? null}
      <CField {...props}>
        <CurrentSetterComp keyPaths={[...keyPaths]} {...setterProps} />
      </CField>
      {switcher}
      {props.suffix ?? null}
    </div>
  );
};
