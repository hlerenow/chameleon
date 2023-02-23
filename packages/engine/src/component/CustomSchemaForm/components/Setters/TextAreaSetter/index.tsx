import React from 'react';
import { ConfigProvider, Input } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { TextAreaProps } from 'antd/es/input';

export const TextAreaSetter: CSetter<TextAreaProps> = ({
  onValueChange,
  setterContext,
  ...props
}: CSetterProps<TextAreaProps>) => {
  const { keyPaths, onSetterChange } = setterContext;
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <Input.TextArea
        {...props}
        onChange={(e) => {
          props.onChange?.(e);
          onValueChange?.(e.target.value);
        }}
      />
    </ConfigProvider>
  );
};

TextAreaSetter.setterName = '长文本设置器';
