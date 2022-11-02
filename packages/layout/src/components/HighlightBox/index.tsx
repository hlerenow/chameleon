/* eslint-disable react/no-find-dom-node */
import React, { useEffect, useState } from 'react';
import { DesignRenderInstance } from '@chameleon/render';
import styles from './style.module.scss';
import ReactDOM from 'react-dom';
import { isDOM } from '../../utils';

export type HighlightBoxPropsType = {
  instance: DesignRenderInstance;
};

export const HighlightBox = (prop: HighlightBoxPropsType) => {
  const instance = prop.instance;
  let instanceDom: HTMLElement | null = null;
  console.log('1');
  const dom = ReactDOM.findDOMNode(instance);
  console.log('🚀 ~ file: index.tsx ~ line 17 ~ useEffect ~ dom', dom);
  if (isDOM(dom)) {
    console.log('🚀 ~ file: index.tsx ~ line 117 ~ useEffect ~ dom', dom);
    instanceDom = dom as unknown as HTMLElement;
  }

  const rect = instanceDom?.getBoundingClientRect();
  console.log(
    '🚀 ~ file: index.tsx ~ line 24 ~ HighlightBox ~ rect',
    instance,
    instanceDom,
    rect
  );

  const styleObj = {
    width: rect?.width + 'px',
    height: rect?.height + 'px',
    left: rect?.left + 'px',
    top: rect?.top + 'px',
  };
  console.log(
    '🚀 ~ file: index.tsx ~ line 39 ~ HighlightBox ~ styleObj',
    styleObj
  );
  if (!rect) {
    return null;
  }
  return <div className={styles.highlightBox} style={styleObj}></div>;
};
