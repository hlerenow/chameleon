import React from 'react';
import { CMaterialPropsType } from '@chameleon/model';
import { CForm } from './components/Form';
export declare type CustomSchemaFormInstance = CForm;
export declare type CustomSchemaFormProps = {
    initialValue: Record<string, any>;
    properties: CMaterialPropsType;
    onValueChange?: (val: Record<string, any>) => void;
    onSetterChange: (keyPaths: string[], setterName: string) => void;
    defaultSetterConfig: Record<string, {
        name: string;
        setter: string;
    }>;
};
export declare const CustomSchemaForm: React.ForwardRefExoticComponent<CustomSchemaFormProps & React.RefAttributes<CForm>>;
