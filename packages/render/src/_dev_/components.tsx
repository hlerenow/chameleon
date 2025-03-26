import React, { forwardRef, useImperativeHandle, useState } from 'react';
import * as antD from 'antd';

export const components: any = {
  ...antD,
  Page: ({ children }: any) => {
    return <div style={{ padding: '10px' }}>{children}</div>;
  },
  div: ({ children, COMPONENTS, ...props }: any) => {
    return <div {...props}>{children}</div>;
  },
  Button: forwardRef((props: any, ref) => {
    const [state, setState] = useState(1);
    useImperativeHandle(
      ref,
      () => {
        return {
          setState,
          sayHello: (newVal: any) => {
            setState(newVal + Date.now());
          },
        };
      },
      []
    );
    return <div {...props}>Button{state}</div>;
  }),
};
