/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';

export type ContextState = Record<string, any>;

export type CCustomSchemaFormContextData = {
  onSetterChange: (keyPaths: string[], setterName: string) => void;
  defaultSetterConfig: Record<string, { name: string; setter: string }>;
};

export const CCustomSchemaFormContext =
  React.createContext<CCustomSchemaFormContextData>({
    defaultSetterConfig: {},
    onSetterChange: () => {},
  });
