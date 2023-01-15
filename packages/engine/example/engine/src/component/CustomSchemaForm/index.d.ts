import React from 'react';
import { CMaterialPropsType } from '@chameleon/model';
import { CForm } from './components/Form';
export declare type CustomSchemaFormInstance = CForm;
export declare type CustomSchemaFormProps = {
    initialValue: Record<string, any>;
    properties: CMaterialPropsType;
    onValueChange?: (val: Record<string, any>) => void;
};
export declare const CustomSchemaForm: React.ForwardRefExoticComponent<CustomSchemaFormProps & React.RefAttributes<CForm>>;
