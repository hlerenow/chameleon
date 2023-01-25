import React from 'react';
import { ConfigProvider, Switch, SwitchProps } from 'antd';
import { CSetter, CSetterProps } from '../type';

type BooleanSetterProps = SwitchProps;

export const BooleanSetter: CSetter<BooleanSetterProps> = ({
  onValueChange,
  keyPaths,
  onSetterChange,
  ...props
}: CSetterProps<BooleanSetterProps>) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <Switch
        {...props}
        checked={props.value as boolean}
        onChange={(open, e) => {
          props.onChange?.(open, e);
          onValueChange?.(open);
        }}
      />
    </ConfigProvider>
  );
};

BooleanSetter.setterName = 'Bool 设置器';
