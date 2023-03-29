/// <reference types="react" />
import { CNode, CRootNode } from '@chamn/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';
export type AdvancePanelProps = {
    node: CNode | CRootNode;
    pluginCtx: CPluginCtx;
};
export declare const AdvancePanel: (props: AdvancePanelProps) => JSX.Element;
export declare const AdvancePanelConfig: CRightPanelItem;
