/// <reference types="react" />
import { CNode } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
export declare type ComponentStatePanelProps = {
    node: CNode;
    pluginCtx: CPluginCtx;
};
export declare const ComponentStatePanel: (props: ComponentStatePanelProps) => JSX.Element;
export declare const ComponentStatePanelConfig: CRightPanelItem;
