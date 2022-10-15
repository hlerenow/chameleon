import { checkComplexData } from '../util/dataCheck';
import { CPageDataType, CPageDataTypeDescribe } from '../types/page';
import { DataModelEmitter } from '../util/modelEmitter';
import { CSchema } from './Schema';
import { ExportType } from '../const/schema';
import { CMaterials } from '../Material';
import { CNode } from './Schema/Node';
import { CNodeDataType } from '../types/node';
import { isArray, isPlainObject } from 'lodash-es';
import { CProp } from './Schema/Node/props';

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
  getNode(id: string) {
    const nodeTree = this.data.componentsTree;
    const nodeList: (CSchema | CNode)[] = [nodeTree];
    while (nodeList.length) {
      const target = nodeList.shift();
      if (target?.id === id) {
        return target;
      }

      const props = target?.props || {};

      const dpProps = (prop: unknown) => {
        if (prop instanceof CNode) {
          nodeList.push(prop);
          return;
        }

        if (prop instanceof CProp) {
          dpProps(prop.value);
          return;
        }
        if (isPlainObject(prop)) {
          const obj = prop as Record<string, any>;
          Object.keys(obj).map((key) => {
            dpProps(obj[key]);
          });
          return;
        }

        if (isArray(prop)) {
          prop.forEach((it) => {
            dpProps(it);
          });
          return;
        }
      };

      // 检索所有的 props 中的节点
      dpProps(props);
      // 合并入待索引的列表
      nodeList.push(...(target?.value.children || []));
    }

    return null;
  }

  addNode(
    newNode: CNode,
    targetNode: CNode,
    pos: 'BEFORE' | 'AFTER' | 'CHILD' = 'AFTER'
  ) {
    console.log('pos', pos);
  }

  // replaceNode(targetNode, node) {}

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
