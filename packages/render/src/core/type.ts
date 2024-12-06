import { CNode, CRootNode } from '@chamn/model';

export type RenderInstance = React.ReactInstance & {
  _DESIGN_BOX: boolean;
  _NODE_MODEL: CNode | CRootNode;
  _NODE_ID: string;
  _UNIQUE_ID: string;
  _STATUS?: 'DESTROY';
  _CONDITION?: boolean;
  _dom?: HTMLElement;
  getDom: () => HTMLElement | null | undefined;
};
