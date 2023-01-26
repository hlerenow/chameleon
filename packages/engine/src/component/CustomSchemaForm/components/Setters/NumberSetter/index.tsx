import React from 'react';
import { ConfigProvider, InputNumber, InputNumberProps } from 'antd';
import { CSetter, CSetterProps } from '../type';

export const NumberSetter: CSetter<InputNumberProps> = ({
  onValueChange,
  keyPaths,
  onSetterChange,
  ...props
}: CSetterProps<InputNumberProps>) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <InputNumber
        style={{
          width: '100%',
        }}
        {...props}
        onChange={(value) => {
          props.onChange?.(value);
          onValueChange?.(value);
        }}
      />
    </ConfigProvider>
  );
};

NumberSetter.setterName = '数字设置器';
