/* eslint-disable react/display-name */
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
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
  Button: forwardRef((props: any, ref) => {
    const [state, setState] = useState(1);
    useImperativeHandle(
      ref,
      () => {
        return {
          setState,
        };
      },
      []
    );
    return <div {...props}>Button{state}</div>;
  }),
};
