import { checkComplexData } from '../util/dataCheck';
import { CPageDataType, CPageDataTypeDescribe } from '../types/page';
import { DataModelEmitter } from '../util/modelEmitter';
import { CSchema } from './Schema';
import { ExportType } from '../const/schema';
import { CMaterials } from '../Material';
import { CNode } from './Schema/Node';
import { CNodeDataType } from '../types/node';

export const checkPage = (data: any): CPageDataType => {
  checkComplexData({
    data: data,
    dataStruct: CPageDataTypeDescribe,
    throwError: true,
  });

  return data;
};

export const parsePage = (data: CPageDataType, parent: CPage) => {
  return {
    ...data,
    componentsTree: new CSchema(data.componentsTree, { parent: parent }),
  };
};

export type CPpageDataModelType = Omit<CPageDataType, 'componentsTree'> & {
  componentsTree: CSchema;
};
export class CPage {
  modeType = 'PAGE';
  rawData: CPageDataType;
  emitter = DataModelEmitter;
  data: CPpageDataModelType;
  parent: null | undefined;
  materialModel: CMaterials;
  constructor(
    data: any,
    options?: {
      materials?: any;
    }
  ) {
    checkPage(data);
    this.rawData = JSON.parse(JSON.stringify(data));
    this.materialModel = new CMaterials(options?.materials || []);
    this.data = parsePage(data, this);
  }

  get value() {
    return this.data;
  }

  // replaceNode() {}

  // moveNode(from, to, pos) {}

  addNode(
    newNode: CNode,
    targetNode: CNode,
    pos: 'BEFORE' | 'AFTER' = 'AFTER'
  ) {
    console.log('pos', pos);
  }

  getNode(id: string) {
    const nodeTree = this.data.componentsTree;
  }

  createNode(nodeData: CNodeDataType) {
    const newNode = new CNode(nodeData);
    return newNode;
  }

  // deleteNode(node) {}

  // TODO
  export(mode: ExportType = ExportType.SAVE) {
    const res = {
      ...this.data,
      componentsTree: this.data.componentsTree.export(mode),
    };

    return JSON.parse(JSON.stringify(res));
  }
}
