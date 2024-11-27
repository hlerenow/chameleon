import React, { useEffect } from 'react';
import * as antD from 'antd';

export const components: any = {
  ...antD,
  Page: ({ children }: any) => {
    return <div style={{ padding: '10px' }}>{children}</div>;
  },
  div: ({ children, ...props }: any) => {
    useEffect(() => {
      console.log('init', props, Date.now());
    }, []);
    return <div {...props}>{children}</div>;
  },
};
