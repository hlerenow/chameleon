import { CSchema } from '..';
import { ExportType } from '../../../const/schema';
import { CNodeDataStructDescribe, CNodeDataType } from '../../../types/node';
import { getRandomStr } from '../../../util';
import { checkComplexData } from '../../../util/dataCheck';
import { DataModelEmitter } from '../../../util/modelEmitter';
import { CProp } from './props';

export const checkNode = (data: any) => {
  // check data
  checkComplexData({
    data: data,
    dataStruct: CNodeDataStructDescribe,
    throwError: true,
  });
};

export type CNodeModelDataType = Omit<CNodeDataType, 'children'> & {
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
      res.props[propKey] = new CProp(data.props?.[propKey], {
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
  private rawData: CNodeDataType;
  private data: CNodeModelDataType;
  emitter = DataModelEmitter;
  parent: CNode | CSchema;

  constructor(data: any, { parent }: { parent: CNode | CSchema }) {
    this.rawData = JSON.parse(JSON.stringify(data));
    checkNode(data);
    this.data = parseNode(data, this);
    this.parent = parent;
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

  export(mode?: ExportType) {
    return this.rawData;
  }
}
