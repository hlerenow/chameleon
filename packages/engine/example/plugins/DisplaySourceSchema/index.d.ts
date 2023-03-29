import React from 'react';
import { CPage } from '@chamn/model';
import { EnginContext } from '../../index';
export type DisplaySourceSchemaProps = {
    pageModel: CPage;
    engineCtx: EnginContext;
    children: React.ReactNode;
};
export declare const DisplaySourceSchema: (props: DisplaySourceSchemaProps) => JSX.Element;
