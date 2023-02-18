/* eslint-disable @typescript-eslint/no-empty-function */
import React, { Ref } from 'react';
import { CustomSchemaFormInstance } from '.';
import { CPluginCtx } from '../../core/pluginManager';
import { CForm } from './components/Form';

export type ContextState = Record<string, any>;

export type CCustomSchemaFormContextData = {
  onSetterChange: (keyPaths: string[], setterName: string) => void;
  defaultSetterConfig: Record<string, { name: string; setter: string }>;
  formRef?: Ref<CustomSchemaFormInstance | CForm>;
  pluginCtx?: CPluginCtx;
};

export const CCustomSchemaFormContext =
  React.createContext<CCustomSchemaFormContextData>({
    defaultSetterConfig: {},
    onSetterChange: () => {},
  });
