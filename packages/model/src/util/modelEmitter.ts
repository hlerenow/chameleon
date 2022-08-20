import mitt from 'mitt';
import { CNodeDataType, PropType } from '../types/node';
import { CPageDataType } from '../types/page';
import { CSchemaDataType } from '../types/schema';

export type DataModelEventType = {
  onPageChange: CPageDataType;
  onSchemaChange: CSchemaDataType;
  onNodeChange: CNodeDataType;
  onPropChange: PropType;
};

export const DataModelEmitter = mitt<DataModelEventType>();
