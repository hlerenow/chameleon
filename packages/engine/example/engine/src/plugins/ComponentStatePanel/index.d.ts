/// <reference types="react" />
import { CNode, CRootNode } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
export type ComponentStatePanelProps = {
    node: CNode | CRootNode;
    pluginCtx: CPluginCtx;
};
export declare const ComponentStatePanel: (props: ComponentStatePanelProps) => JSX.Element;
export declare const ComponentStatePanelConfig: CRightPanelItem;
