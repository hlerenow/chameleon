import mitt from 'mitt';
import { CNodeDataType, PropType } from '../types/node';

export type DataModelEventType = {
  onPageChange: any;
  onSchemaChange: any;
  onNodeChange: {
    value: CNodeDataType;
    preValue: CNodeDataType;
  };
  onPropChange: {
    value: PropType;
    preValue: PropType;
  };
};

export const DataModelEmitter = mitt<DataModelEventType>();
