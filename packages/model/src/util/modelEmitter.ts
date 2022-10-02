import mitt from 'mitt';
import { CSchema } from '../Page/Schema';
import { CNode } from '../Page/Schema/Node';
import { CProp } from '../Page/Schema/Node/props';
import { CNodeDataType, CPropType } from '../types/node';

export type DataModelEventType = {
  onPageChange: any;
  onSchemaChange: any;
  onNodeChange: {
    value: string | CNodeDataType;
    preValue: string | CNodeDataType;
    node: CProp | CNode | CSchema;
  };
  onPropChange: {
    value: CPropType;
    preValue: CPropType;
    node: CProp | CNode | CSchema;
  };
};

export const DataModelEmitter = mitt<DataModelEventType>();
