import React from 'react';
import { ConfigProvider, Input, InputProps } from 'antd';

export const ArraySetter = ({
  onValueChange,
  ...props
}: InputProps & {
  onValueChange?: (val: string) => void;
}) => {
  console.log('ArraySetter', props);
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
