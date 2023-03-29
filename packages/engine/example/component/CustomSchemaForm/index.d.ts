import React from 'react';
import { CMaterialPropsType } from '@chamn/model';
import { CForm } from './components/Form';
import { CPluginCtx } from '../../core/pluginManager';
export type CustomSchemaFormInstance = CForm;
export type CustomSchemaFormProps = {
    pluginCtx?: CPluginCtx;
    initialValue: Record<string, any>;
    properties: CMaterialPropsType<any>;
    onValueChange?: (val: any) => void;
    onSetterChange: (keyPaths: string[], setterName: string) => void;
    defaultSetterConfig: Record<string, {
        name: string;
        setter: string;
    }>;
};
export declare const CustomSchemaForm: React.ForwardRefExoticComponent<CustomSchemaFormProps & React.RefAttributes<CForm>>;
