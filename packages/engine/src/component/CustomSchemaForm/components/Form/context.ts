/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { CSetter } from '../Setters/type';

export type ContextState = Record<string, any>;

export type CFormContextData = {
  formName: string;
  formState: ContextState;
  conditionConfig: Record<string, (state: ContextState) => boolean>;
  // 自定义 setter 的具体实现，可以覆盖默认 setter
  customSetterMap?: Record<string, CSetter>;
  updateContext: (newState: ContextState, changeKeys?: string[]) => void;
  updateConditionConfig: (name: string, cb: (state: ContextState) => boolean) => void;
};

export const CFormContext = React.createContext<CFormContextData>({
  formName: '',
  formState: {},
  conditionConfig: {},
  updateContext: () => {},
  updateConditionConfig: () => {},
  // 自定义 setter 的具体实现，可以覆盖默认 setter
  customSetterMap: {},
});
