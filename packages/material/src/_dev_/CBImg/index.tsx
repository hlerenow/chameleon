import { useEffect } from 'react';
import * as React from 'react';
import { BasicComponentProps } from '../../types';

export type CBImgPropsType = BasicComponentProps & {
  src?: string;
};
export const CBImg = (props: CBImgPropsType) => {
  const { children, ...restProps } = props;

  return (
    <img
      {...restProps}
      style={{
        maxWidth: '100%',
        ...restProps.style,
      }}
    ></img>
  );
};
