import React from 'react';
import * as antD from 'antd';

export const components = {
  ...antD,
  Page: ({ children }: any) => {
    return <div style={{ padding: '10px' }}>{children}</div>;
  },
  div: ({ children, ...props }: any) => {
    return <div {...props}>{children}</div>;
  },
};
