import { CNode } from '.';
import { ExportType } from '../../../const/schema';
import { CMaterials } from '../../../Material';

import { RenderPropType } from '../../../types/node';
import { getRandomStr } from '../../../util';
import { isArray, isPlainObject } from '../../../util/lodash';
import { DataModelEmitter, DataModelEmitterType } from '../../../util/modelEmitter';
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
  let material = new CMaterials([]);
  if (parent) {
    material = parent.materialsMode || new CMaterials([]);
  }
  if (nodeValue) {
    if (isArray(nodeValue)) {
      newData.value = nodeValue.map(
        (el) =>
          new CNode(el, {
            parent,
            materials: material,
          })
      );
    } else if (isPlainObject(nodeValue)) {
      newData.value.push(
        new CNode(nodeValue, {
          parent: parent,
          materials: material,
        })
      );
    }
  }
  return newData;
};

export class CSlot {
  nodeType = 'SLOT' as const;
  private rawData: RenderPropType;
  parent: CProp | null;
  emitter: DataModelEmitterType = DataModelEmitter;
  private data: CJSSlotPropDataType;
  id: string;
  materialsMode: CMaterials;
  constructor(data: RenderPropType, options?: { parent: CProp | null; materials: CMaterials }) {
    this.parent = options?.parent || null;
    this.rawData = data;
    const materials = options?.materials || new CMaterials([]);
    this.materialsMode = materials;
    this.id = getRandomStr();
    this.data = parseData(data, this);
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
