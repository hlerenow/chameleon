import { CNode, CSchema } from '@chameleon/model';

export type RenderInstance = React.ReactInstance & {
  _DESIGN_BOX: boolean;
  _NODE_MODEL: CNode | CSchema;
  _NODE_ID: string;
  _UNIQUE_ID: string;
  _STATUS?: 'DESTROY';
  _CONDITION?: boolean;
};
