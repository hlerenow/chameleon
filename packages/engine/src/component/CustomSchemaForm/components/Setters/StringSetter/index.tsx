import React from 'react';
import { ConfigProvider, Input, InputProps } from 'antd';
import { CSetter, CSetterProps } from '../type';

export const StringSetter: CSetter<InputProps> = ({
  onValueChange,
  setterContext,
  ...props
}: CSetterProps<InputProps>) => {
  const { keyPaths, onSetterChange } = setterContext;
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

StringSetter.setterName = '字符设置器';
