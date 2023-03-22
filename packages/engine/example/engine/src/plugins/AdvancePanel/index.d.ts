/// <reference types="react" />
import { CNode, CRootNode } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
export declare type AdvancePanelProps = {
    node: CNode | CRootNode;
    pluginCtx: CPluginCtx;
};
export declare const AdvancePanel: (props: AdvancePanelProps) => JSX.Element;
export declare const AdvancePanelConfig: CRightPanelItem;
