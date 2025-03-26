import React from 'react';
import { ConfigProvider, InputNumber, InputNumberProps } from 'antd';
import { CSetter, CSetterProps } from '../type';

export const NumberSetter: CSetter<InputNumberProps> = ({
  onValueChange,
  setterContext,
  initialValue,
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
        value={props.value ?? initialValue}
        onChange={(value) => {
          props.onChange?.(value);
          onValueChange?.(value);
        }}
      />
    </ConfigProvider>
  );
};

NumberSetter.setterName = '数字设置器';
