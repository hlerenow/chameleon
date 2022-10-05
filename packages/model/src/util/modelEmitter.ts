import mitt from 'mitt';
import { CSchema, CSchemaModelDataType } from '../Page/Schema';
import { CNode, CNodeModelDataType } from '../Page/Schema/Node';
import { CProp } from '../Page/Schema/Node/props';
import { CPropDataType } from '../types/node';

export type DataModelEventType = {
  onPageChange: any;
  onSchemaChange: any;
  onNodeChange: {
    value: CNodeModelDataType | CSchemaModelDataType;
    preValue: CNodeModelDataType | CSchemaModelDataType;
    node: CNode | CSchema;
  };
  onPropChange: {
    value: CPropDataType;
    preValue: CPropDataType;
    node: CProp;
  };
};

export const DataModelEmitter = mitt<DataModelEventType>();
