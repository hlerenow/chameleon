import React from 'react';
import { ConfigProvider, Input, InputProps } from 'antd';

export const StringSetter = (props: InputProps) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <Input {...props} />
    </ConfigProvider>
  );
};
