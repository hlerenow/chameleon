import React from 'react';
import {
  ConfigProvider,
  InputNumber,
  InputNumberProps,
  InputProps,
} from 'antd';
import { CSetter, CSetterProps } from '../type';

export const NumberSetter: CSetter<InputNumberProps> = ({
  onValueChange,
  keyPaths,
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
