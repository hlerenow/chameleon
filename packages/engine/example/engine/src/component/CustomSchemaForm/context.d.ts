import React, { Ref } from 'react';
import { CustomSchemaFormInstance } from '.';
import { CPluginCtx } from '../../core/pluginManager';
import { CForm } from './components/Form';
export declare type ContextState = Record<string, any>;
export declare type CCustomSchemaFormContextData = {
    onSetterChange: (keyPaths: string[], setterName: string) => void;
    defaultSetterConfig: Record<string, {
        name: string;
        setter: string;
    }>;
    formRef?: Ref<CustomSchemaFormInstance | CForm>;
    pluginCtx?: CPluginCtx;
};
export declare const CCustomSchemaFormContext: React.Context<CCustomSchemaFormContextData>;
