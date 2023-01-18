import React from 'react';
import { ConfigProvider, Input, InputProps } from 'antd';
import { CSetter, CSetterProps } from '../type';

export const NumberSetter: CSetter<InputProps> = ({
  onValueChange,
  keyPaths,
  onSetterChange,
  ...props
}: CSetterProps<InputProps>) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <Input
        {...props}
        onChange={(e) => {
          props.onChange?.(e);
          onValueChange?.(e.target.value);
        }}
      />
    </ConfigProvider>
  );
};

NumberSetter.setterName = '数字设置器';
