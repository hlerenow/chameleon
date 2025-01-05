import React from 'react';
import { DYNAMIC_COMPONENT_TYPE, InnerPropList } from '../../const';
import { ContextType } from '../adapter';
import { isPropModel } from '@chamn/model';
import { isArray, isPlainObject } from 'lodash-es';

export const getContext = (data: ContextType, ctx?: ContextType | null): ContextType => {
  let newCtx: ContextType = data;
  if (ctx) {
    newCtx = {
      ...data,
    };
    (newCtx as any).__proto__ = ctx || null;
  }
  return newCtx;
};

export const renderComponent = (
  originalComponent: React.ComponentClass<any> | React.FunctionComponent | string,
  props: Record<any, any> = {},
  ...children: React.ReactNode[]
) => {
  if (typeof originalComponent === 'string' || typeof originalComponent === 'number') {
    return String(originalComponent);
  }
  InnerPropList.forEach((key) => {
    if (key in props && (originalComponent as any).__CP_TYPE__ !== DYNAMIC_COMPONENT_TYPE) {
      delete props[key];
    }
  });
  const res = React.createElement(originalComponent, props, ...children);
  return res;
};

export const collectSpecialProps = (
  originalProps: Record<string, unknown> = {},
  isValidate: (val: unknown) => boolean
) => {
  const res: { keyPath: string[]; val: any }[] = [];
  const cb = (keyPath: string[], val: Record<string, any>) => {
    let tempVal: any = val;
    if (isPropModel(val)) {
      tempVal = val.value;
    }
    if (isValidate(tempVal)) {
      res.push({
        keyPath,
        val: tempVal,
      });
    } else if (isArray(tempVal)) {
      tempVal.forEach((it, index) => {
        cb([...keyPath, String(index)], it);
      });
    } else if (isPlainObject(tempVal)) {
      Object.keys(tempVal).forEach((key) => {
        cb([...keyPath, key], tempVal[key]);
      });
    }
  };

  cb(['$root'], originalProps);
  return res;
};
