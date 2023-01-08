import React from 'react';
import { ConfigProvider, Input, InputProps } from 'antd';

export const StringSetter = ({
  onValueChange,
  ...props
}: InputProps & {
  onValueChange?: (val: string) => void;
}) => {
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
