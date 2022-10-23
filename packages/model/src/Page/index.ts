import { checkComplexData } from '../util/dataCheck';
import { CPageDataType, CPageDataTypeDescribe } from '../types/page';
import { DataModelEmitter } from '../util/modelEmitter';
import { CSchema } from './Schema';
import { ExportType } from '../const/schema';
import { CMaterials } from '../Material';
import { CNode } from './Schema/Node';
import { CNodeDataType } from '../types/node';
import { isArray, isPlainObject } from 'lodash-es';
import { CProp } from './Schema/Node/prop';
import { CSlot } from './Schema/Node/slot';

export const checkPage = (data: any): CPageDataType => {
  checkComplexData({
    data: data,
    dataStruct: CPageDataTypeDescribe,
    throwError: true,
  });

  return data;
};

export const parsePage = (
  data: CPageDataType,
  parent: CPage,
  materials: CMaterials
) => {
  return {
    ...data,
    componentsTree: new CSchema(data.componentsTree, {
      parent: parent,
      materials,
    }),
  };
};

export type CPpageDataModelType = Omit<CPageDataType, 'componentsTree'> & {
  componentsTree: CSchema;
};

export type PosObj = {
  type: 'CHILD';
  index: number;
  pos: 'BEFORE' | 'AFTER';
};

export type InsertNodePosType =
  | 'BEFORE'
  | 'AFTER'
  | 'CHILD_START'
  | 'CHILD_END'
  | PosObj;

export class CPage {
  nodeType = 'PAGE';
  rawData: CPageDataType;
  emitter = DataModelEmitter;
  data: CPpageDataModelType;
  parent: null | undefined;
  materialsModel: CMaterials;
  constructor(
    data: CPageDataType,
    options?: {
      materials?: any;
    }
  ) {
    checkPage(data);
    this.rawData = JSON.parse(JSON.stringify(data));
    this.materialsModel = new CMaterials(options?.materials || []);
    this.data = parsePage(data, this, this.materialsModel);
  }

  get value() {
    return this.data;
  }

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

        if (prop instanceof CSlot) {
          dpProps(prop.value.value);
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
      const tempNodeList: CNode[] =
        (target?.value.children.filter(
          (el) => el instanceof CNode
        ) as CNode[]) || [];
      nodeList.push(...tempNodeList);
    }

    return null;
  }

  addNode(
    newNode: CNode,
    targetNode: CNode | CSchema,
    pos: InsertNodePosType = 'AFTER'
  ) {
    console.log('pos', pos);
    if (pos === 'AFTER' || pos === 'BEFORE') {
      const parentNode = targetNode.parent;
      // 说明是容器节点, 只能插入 child
      if (parentNode === null && targetNode instanceof CSchema) {
        throw new Error('Not found parent node');
      }

      if (parentNode instanceof CProp) {
        console.log('CProp can not add node');
        return;
      }
      // TODO:
      if (parentNode instanceof CSlot) {
        const parentList = parentNode.value.value;
        // find it on children;
        const targetIndex =
          parentList.findIndex((el) => el === targetNode) ?? -1;
        if (targetIndex >= 0) {
          if (pos === 'BEFORE') {
            parentList.splice(targetIndex, 0, newNode);
          } else {
            parentList.splice(targetIndex + 1, 0, newNode);
          }
          parentNode.parent?.updateValue();
          return;
        }
        return;
      }
      // TODO:
      if (parentNode instanceof CPage) {
        return;
      }
      // find it on children;
      const targetIndex =
        parentNode?.value.children.findIndex((el) => el === targetNode) ?? -1;
      if (targetIndex >= 0) {
        if (pos === 'BEFORE') {
          parentNode?.value.children.splice(targetIndex, 0, newNode);
        } else {
          parentNode?.value.children.splice(targetIndex + 1, 0, newNode);
        }
        parentNode?.updateValue();
        return;
      }

      console.warn('Not found target node');
      return;
    }

    if (pos === 'CHILD_START') {
      targetNode.value.children.unshift(newNode);
      targetNode.updateValue();
      return;
    }

    if (pos === 'CHILD_END') {
      targetNode.value.children.push(newNode);
      targetNode.updateValue();
      return;
    }

    if (isPlainObject(pos)) {
      const posObj = pos as PosObj;
      if (posObj.type === 'CHILD') {
        const subPos = posObj.pos;
        const index = posObj.index || 0;
        if (subPos === 'BEFORE') {
          targetNode?.value.children.splice(index, 0, newNode);
        } else {
          targetNode?.value.children.splice(index + 1, 0, newNode);
        }
        targetNode.updateValue();
      } else {
        console.warn('Can not parse pos obj');
      }
    }
  }

  addNodeById(
    newNode: CNode,
    targetNodeId: string,
    pos: InsertNodePosType = 'AFTER'
  ) {
    const targetNode = this.getNode(targetNodeId);
    if (targetNode) {
      this.addNode(newNode, targetNode, pos);
    } else {
      console.warn(`Not find a node by ${targetNodeId}, pls check it`);
    }
  }

  // replaceNode(targetNode, node) {}

  createNode(nodeData: CNodeDataType) {
    const newNode = new CNode(nodeData);
    return newNode;
  }

  deleteNode(node: CNode | CSchema) {
    const parent = node.parent;
    if (!parent) {
      throw new Error('parent node is null or undefined, pls check it');
    }

    if (parent instanceof CSlot) {
      const childList = parent.value.value;
      const targetIndex = childList.findIndex((el) => el === node);
      childList.splice(targetIndex, 1);
      parent.parent?.updateValue();
      return;
    }

    if (parent instanceof CNode || parent instanceof CSchema) {
      const childList = parent.value.children;
      const targetIndex = childList.findIndex((el) => el === node);
      childList.splice(targetIndex, 1);
      parent.updateValue();
      return;
    }
  }

  // TODO
  export(mode: ExportType = ExportType.SAVE) {
    const res = {
      ...this.data,
      componentsTree: this.data.componentsTree.export(mode),
    };

    return JSON.parse(JSON.stringify(res));
  }
}
