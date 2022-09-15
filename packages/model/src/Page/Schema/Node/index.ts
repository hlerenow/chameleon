import { CSchema } from '..';
import { ExportType } from '../../../const/schema';
import { CMaterials } from '../../../Material';
import { CNodeDataStructDescribe, CNodeDataType } from '../../../types/node';
import { getRandomStr } from '../../../util';
import { checkComplexData } from '../../../util/dataCheck';
import { DataModelEmitter } from '../../../util/modelEmitter';
import { CProp } from './props';

export const checkNode = (data: any) => {
  if (typeof data === 'string') {
    return true;
  }
  // check data
  checkComplexData({
    data: data,
    dataStruct: CNodeDataStructDescribe,
    throwError: true,
  });
};

export type CNodeModelDataType = Omit<CNodeDataType, 'children'> & {
  id: string;
  children: CNode[];
  props: Record<string, CProp>;
};
export const parseNode = (data: CNodeDataType, parent: CNode) => {
  const res: CNodeModelDataType = {
    ...data,
    id: data.id ?? getRandomStr(),
    children: [],
    props: {},
  };

  const propsKeys = Object.keys(data.props || {});
  if (propsKeys.length) {
    propsKeys.forEach((propKey) => {
      res.props[propKey] = new CProp(propKey, data.props?.[propKey], {
        parent: parent,
      });
    });
  }
  if (res.children?.length) {
    res.children = res.children.map((el) => {
      return new CNode(el, {
        parent: parent,
      });
    });
  }

  return res;
};

export class CNode {
  modeType = 'NODE';
  private rawData: CNodeDataType | string;
  private data: CNodeModelDataType;
  emitter = DataModelEmitter;
  parent: CNode | CSchema | null;
  materialModel: CMaterials | null;

  constructor(data: any, options?: { parent?: CNode | CSchema | null }) {
    this.rawData = JSON.parse(JSON.stringify(data));
    checkNode(data);
    this.parent = options?.parent || null;
    this.materialModel = options?.parent?.materialModel || null;
    this.data = parseNode(data, this);
  }

  get value(): CNodeModelDataType {
    return this.data;
  }

  set value(val: Partial<CNodeModelDataType>) {
    this.data = {
      ...this.data,
      ...val,
    };
  }

  get props() {
    return this.data.props;
  }

  get material() {
    const materialModel = this.materialModel;
    return materialModel?.findByComponentName(this.data.componentName);
  }

  // 该节点是不是纯文本节点
  isText() {
    if (typeof this.data === 'string') {
      return true;
    } else {
      return false;
    }
  }

  export(mode?: ExportType) {
    return this.rawData;
  }
}
