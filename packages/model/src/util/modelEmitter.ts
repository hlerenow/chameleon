import mitt from 'mitt';
import { CSchema } from '../Page/Schema';
import { CNode } from '../Page/Schema/Node';
import { CProp } from '../Page/Schema/Node/props';
import { CNodeDataType, PropType } from '../types/node';

export type DataModelEventType = {
  onPageChange: any;
  onSchemaChange: any;
  onNodeChange: {
    value: string | CNodeDataType;
    preValue: string | CNodeDataType;
    node: CProp | CNode | CSchema;
  };
  onPropChange: {
    value: PropType;
    preValue: PropType;
    node: CProp | CNode | CSchema;
  };
};

export const DataModelEmitter = mitt<DataModelEventType>();
