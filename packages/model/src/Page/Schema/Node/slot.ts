import { CNode } from '.';
import { CSchema } from '..';
import { ExportType } from '../../../const/schema';
import { CMaterials } from '../../../Material';

import { RenderPropType } from '../../../types/node';
import { getRandomStr } from '../../../util';
import { isArray, isPlainObject } from '../../../util/lodash';
import { DataModelEmitter } from '../../../util/modelEmitter';
import { CProp } from './prop';

export type CJSSlotPropDataType = Omit<RenderPropType, 'value'> & {
  value: CNode[];
};
type ParentType = CSlot | null;

// 递归处理所有的节点
const parseData = (data: any, parent?: ParentType) => {
  const newData: CJSSlotPropDataType = {
    ...data,
    value: [],
  };
  const nodeValue = data.value;
  if (nodeValue) {
    if (isArray(nodeValue)) {
      newData.value = nodeValue.map((el) => new CNode(el));
    } else if (isPlainObject(nodeValue)) {
      newData.value.push(new CNode(nodeValue, { parent: parent }));
    }
  }
  return newData;
};

export class CSlot {
  nodeType = 'SLOT';
  private rawData: RenderPropType;
  parent: CProp | null;
  emitter = DataModelEmitter;
  private data: CJSSlotPropDataType;
  id: string;
  constructor(
    data: RenderPropType,
    { parent }: { parent: CProp | null; materials?: CMaterials | null }
  ) {
    this.parent = parent;
    this.rawData = data;
    this.data = parseData(data, this);
    this.id = getRandomStr();
  }

  get value() {
    return this.data;
  }

  export(mode: ExportType) {
    const data = this.data;
    const handleSingleProps = (propVal: any) => {
      if (propVal instanceof CNode) {
        return propVal.export(mode);
      }
      if (isPlainObject(propVal)) {
        const newObj: Record<string, any> = {};

        Object.keys(propVal || {}).forEach((key) => {
          newObj[key] = handleSingleProps(propVal[key]);
        });
        return newObj;
      }

      if (isArray(propVal)) {
        const newList: any[] = propVal.map((el) => {
          return handleSingleProps(el);
        });
        return newList;
      }
      if (mode === 'design') {
        delete propVal.id;
      }
      return propVal;
    };
    return handleSingleProps(data);
  }
}
