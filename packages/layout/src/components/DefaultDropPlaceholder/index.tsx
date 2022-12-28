import { CNode, CSchema } from '@chameleon/model';
import React from 'react';

export const DefaultDropPlaceholder = (props: {
  node: CNode | CSchema;
  placeholder?: string;
  width?: number;
  height?: number;
}) => {
  const {
    placeholder = 'Drag the component to place it',
    width = 300,
    height = 50,
  } = props;
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(200,200,200,0.1)',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '2px',
        fontSize: '14px',
        color: 'gray',
        cursor: 'default',
        width: width,
        height: height,
      }}
    >
      {placeholder}
    </span>
  );
};
