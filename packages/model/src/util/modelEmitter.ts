import mitt from 'mitt';
import { CRootNode, CRootNodeModelDataType } from '../Page/RootNode';
import { CNode, CNodeModelDataType } from '../Page/RootNode/Node';
import { CProp } from '../Page/RootNode//Node/prop';
import { CPropDataType } from '../types/node';

export type DataModelEventType = {
  onPageChange: any;
  onSchemaChange: any;
  onNodeChange: {
    value: CNodeModelDataType | CRootNodeModelDataType;
    preValue: CNodeModelDataType | CRootNodeModelDataType;
    node: CNode | CRootNode;
  };
  onPropChange: {
    value: CPropDataType;
    preValue: CPropDataType;
    node: CProp;
  };
};

export const DataModelEmitter = mitt<DataModelEventType>();
