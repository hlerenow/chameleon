import { checkComplexData } from '../util/dataCheck';
import { CPageDataType, CPageDataTypeDescribe } from '../types/page';
import { DataModelEmitter } from '../util/modelEmitter';
import { CSchema } from './Schema';
import { ExportType, ExportTypeEnum } from '../const/schema';
import { CMaterials } from '../Material';
import { CNode } from './Schema/Node';
import { CNodeDataType } from '../types/node';
import { isPlainObject, omit } from 'lodash-es';
import { CProp } from './Schema/Node/prop';
import { CSlot } from './Schema/Node/slot';
import { clearSchema, getNode, getRandomStr } from '../util';

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
    return getNode(nodeTree, id);
  }

  addNode(
    newNode: CNode,
    targetNode: CNode | CSchema,
    pos: InsertNodePosType = 'AFTER'
  ) {
    if (pos === 'AFTER' || pos === 'BEFORE') {
      const parentNode = targetNode.parent;
      // 说明是容器节点, 只能插入 child
      if (parentNode === null && targetNode instanceof CSchema) {
        console.warn('Not found parent node');
        return false;
      }

      if (parentNode instanceof CProp) {
        console.warn('CProp can not add node');
        return false;
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
          newNode.parent = parentNode;
          parentNode.parent?.updateValue();
          return true;
        }
        return false;
      }
      // TODO:
      if (parentNode instanceof CPage) {
        return false;
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
        newNode.parent = parentNode;
        parentNode?.updateValue();
        return true;
      }
      console.warn('Not found target node');
      return false;
    }

    if (pos === 'CHILD_START') {
      targetNode.value.children.unshift(newNode);
      newNode.parent = targetNode;
      targetNode.updateValue();
      return true;
    }

    if (pos === 'CHILD_END') {
      targetNode.value.children.push(newNode);
      newNode.parent = targetNode;
      targetNode.updateValue();
      return true;
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
        newNode.parent = targetNode;
        targetNode.updateValue();
        return true;
      } else {
        console.warn('Can not parse pos obj');
      }
    }
    return false;
  }

  createNode(nodeData: CNodeDataType) {
    delete nodeData.id;
    const newNode = new CNode(nodeData, {
      parent: null,
    });
    return newNode;
  }

  addNodeById(
    newNode: CNode,
    targetNodeId: string,
    pos: InsertNodePosType = 'AFTER'
  ) {
    const targetNode = this.getNode(targetNodeId);
    if (targetNode) {
      return this.addNode(newNode, targetNode, pos);
    } else {
      console.warn(`Not find a node by ${targetNodeId}, pls check it`);
      return false;
    }
  }

  copyNode(node: CNode) {
    const newNodeData = node.export('design');
    newNodeData.id = getRandomStr();
    const newNode = new CNode(newNodeData, {
      parent: node.parent,
    });
    this.addNode(newNode, node, 'AFTER');
    return newNode;
  }

  copyNodeById(nodeId: string) {
    const node = this.getNode(nodeId);
    if (node && node instanceof CNode) {
      return this.copyNode(node);
    } else {
      return false;
    }
  }

  moveNode(from: CNode, to: CNode, pos: InsertNodePosType) {
    this.deleteNode(from);
    let parent: any = to;
    const tempTypeList: InsertNodePosType[] = ['AFTER', 'BEFORE'];
    if (tempTypeList.includes(pos)) {
      parent = to.parent;
    }
    from.parent = parent;

    return this.addNode(from, to, pos);
  }

  moveNodeById(fromId: string, toId: string, pos: InsertNodePosType) {
    const from = this.getNode(fromId);
    const to = this.getNode(toId);
    if (from && to && from instanceof CNode && to instanceof CNode) {
      return this.moveNode(from, to, pos);
    }

    return false;
  }

  // replaceNode(targetNode, node) {}

  deleteNode(node: CNode | CSchema) {
    const parent = node.parent;
    if (!parent) {
      throw new Error('parent node is null or undefined, pls check it');
    }

    if (parent instanceof CSlot) {
      const childList = parent.value.value;
      const targetIndex = childList.findIndex((el) => el === node);
      const deleteNode = childList[targetIndex];

      childList.splice(targetIndex, 1);
      parent.parent?.updateValue();

      return deleteNode;
    }

    if (parent instanceof CNode || parent instanceof CSchema) {
      const childList = parent.value.children;
      const targetIndex = childList.findIndex((el) => el === node);
      const deleteNode = childList[targetIndex];

      childList.splice(targetIndex, 1);
      parent.updateValue();
      return deleteNode;
    }
  }

  deleteNodeById(nodeId: string) {
    const node = this.getNode(nodeId);
    if (node) {
      return this.deleteNode(node);
    }
  }

  // TODO
  export(mode: ExportType = ExportTypeEnum.SAVE) {
    let res = {
      ...this.data,
      componentsTree: this.data.componentsTree.export(mode),
    };
    res = omit(res, ['id']) as any;
    res = clearSchema(res);

    return JSON.parse(JSON.stringify(res));
  }
}
