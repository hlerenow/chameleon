import React from 'react';
import { ConfigProvider, Select, SelectProps } from 'antd';
import { CSetter, CSetterProps } from '../type';

export const SelectSetter: CSetter<SelectProps> = ({
  onValueChange,
  setterContext,
  initialValue,
  ...props
}: CSetterProps<SelectProps>) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <Select
        showSearch
        style={{
          width: '100%',
        }}
        {...props}
        value={props.value ?? initialValue}
        onChange={(val, option) => {
          props.onChange?.(val, option);
          onValueChange?.(val);
        }}
      />
    </ConfigProvider>
  );
};

SelectSetter.setterName = '选择设置器';
