import { CNode, ContainerConfig, CRootNode } from '@chamn/model';
import React from 'react';

export const DefaultDropPlaceholder = (props: {
  node: CNode | CRootNode;
  placeholder?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}) => {
  const containerConfig = props.node.isContainer();
  const config = (typeof containerConfig === 'object' ? containerConfig : {}) as Partial<ContainerConfig>;
  const {
    placeholder = 'Drag the component to place it',
    width = config.width || '100%',
    height = config.height || '100%',
    style = config.style,
  } = props;
  return (
    <span
      style={{
        margin: 0,
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(44, 115, 253, 0.04)',
        border: '1px dashed rgba(44, 115, 253, 0.42)',
        borderRadius: '3px',
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '0.01em',
        color: 'rgba(44, 83, 145, 0.72)',
        cursor: 'default',
        minHeight: '50px',
        width,
        height,
        boxSizing: 'border-box',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        ...style,
      }}
    >
      {placeholder}
    </span>
  );
};
