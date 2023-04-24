import { checkComplexData } from '../util/dataCheck';
import { ComponentMetaType, CPageDataType, CPageDataTypeDescribe } from '../types/page';
import { DataModelEmitter } from '../util/modelEmitter';
import { CRootNode } from './RootNode';
import { ExportType, ExportTypeEnum } from '../const/schema';
import { CMaterials } from '../Material';
import { CNode } from './RootNode/Node';
import { CNodeDataType } from '../types/node';
import { cloneDeep, get, isPlainObject, omit, unionBy } from 'lodash-es';
import { CProp } from './RootNode/Node/prop';
import { CSlot } from './RootNode/Node/slot';
import { clearSchema, findNode, getNode, getRandomStr } from '../util';
import { InnerComponentNameEnum } from '../types/rootNode';
import { AssetPackage } from '../types/base';
import { CMaterialType } from '../types/material';

export const checkPage = (data: any): CPageDataType => {
  checkComplexData({
    data: data,
    dataStruct: CPageDataTypeDescribe,
    throwError: false,
  });

  return data;
};

export const parsePage = (data: CPageDataType, parent: CPage, materials: CMaterials) => {
  return {
    ...data,
    componentsTree: new CRootNode(data.componentsTree, {
      parent: parent,
      materials,
    }),
  };
};

export type CPpageDataModelType = Omit<CPageDataType, 'componentsTree'> & {
  componentsTree: CRootNode;
};

export type PosObj = {
  type: 'CHILD';
  index: number;
  pos: 'BEFORE' | 'AFTER';
};

export type InsertNodePosType = 'BEFORE' | 'AFTER' | 'CHILD_START' | 'CHILD_END' | PosObj;

export class CPage {
  nodeType = 'PAGE';
  rawData: CPageDataType;
  emitter = DataModelEmitter;
  data: CPpageDataModelType;
  parent: null | undefined;
  materialsModel: CMaterials;
  assetPackagesList: AssetPackage[];

  constructor(
    data: CPageDataType,
    options?: {
      materials?: CMaterialType[];
      assetPackagesList?: AssetPackage[];
    }
  ) {
    checkPage(data);
    this.assetPackagesList = options?.assetPackagesList || [];
    this.rawData = JSON.parse(JSON.stringify(data));
    this.materialsModel = new CMaterials(options?.materials || []);
    this.data = parsePage(data, this, this.materialsModel);
  }

  updatePage(data: CPageDataType) {
    const oldData = this.data;
    this.rawData = JSON.parse(JSON.stringify(data));
    this.data = parsePage(data, this, this.materialsModel);
    this.emitter.emit('onPageChange', {
      value: this.data,
      preValue: oldData,
      node: this,
    });
  }

  reloadPage(data: CPageDataType) {
    const oldData = this.data;
    this.rawData = JSON.parse(JSON.stringify(data));
    this.data = parsePage(data, this, this.materialsModel);
    this.emitter.emit('onReloadPage', {
      value: this.data,
      preValue: oldData,
      node: this,
    });
  }

  get value() {
    return this.data;
  }

  // moveNode(from, to, pos) {}
  getNode(id: string) {
    const nodeTree = this.data.componentsTree;
    return getNode(nodeTree, id);
  }

  addNode(newNode: CNode, targetNode: CNode | CRootNode, pos: InsertNodePosType = 'AFTER') {
    if (pos === 'AFTER' || pos === 'BEFORE') {
      const parentNode = targetNode.parent;
      // 说明是容器节点, 只能插入 child
      if (parentNode === null && targetNode instanceof CRootNode) {
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
        const targetIndex = parentList.findIndex((el) => el === targetNode) ?? -1;
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
      const targetIndex = parentNode?.value.children.findIndex((el) => el === targetNode) ?? -1;
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
      materials: this.materialsModel,
    });
    return newNode;
  }

  addNodeById(newNode: CNode, targetNodeId: string, pos: InsertNodePosType = 'AFTER') {
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
      materials: this.materialsModel,
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

  deleteNode(node: CNode | CRootNode) {
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

    if (parent instanceof CNode || parent instanceof CRootNode) {
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
  export(mode: ExportType = ExportTypeEnum.SAVE): CPageDataType {
    const componentsTree = this.data.componentsTree.export(mode);

    const assetPackagesList = this.assetPackagesList;

    const finalAssets: AssetPackage[] = [];
    const componentsMetaList: ComponentMetaType[] = this.materialsModel.usedMaterials.map((it) => {
      const asset = assetPackagesList.find((el) => {
        return el.package === it.value.npm?.package;
      });
      if (asset) {
        finalAssets.push(asset);
      }
      return {
        componentName: it.componentName,
        ...cloneDeep(it.value.npm || {}),
      } as ComponentMetaType;
    });
    // 剔除不合法的meta
    const finalComponentsMetaList = componentsMetaList.filter((el) => {
      if (el.componentName && el.package && el.version) {
        return true;
      }
      return false;
    });
    this.materialsModel.usedMaterials = [];
    let res: CPageDataType = {
      ...this.data,
      componentsTree: clearSchema(componentsTree),
      componentsMeta: finalComponentsMetaList,
      thirdLibs: this.data.thirdLibs,
      assets: [],
    };

    this.data.thirdLibs?.forEach((thirdEl) => {
      const asset = assetPackagesList.find((el) => {
        return thirdEl.package === el.package;
      });
      if (asset) {
        finalAssets.push(asset);
      }
    });

    res.assets = unionBy(finalAssets, (el) => el.package);
    res = omit(res, ['id']) as any;
    return JSON.parse(JSON.stringify(res));
  }

  getRootNode() {
    const nodeTree = this.data.componentsTree;
    return findNode(nodeTree, (item) => {
      const componentName = get(item, 'data.componentName') || get(item, 'rawData.componentName');
      return componentName === InnerComponentNameEnum.ROOT_CONTAINER;
    });
  }
}

export const EmptyPage: CPageDataType = {
  version: '1.0.0',
  name: 'EmptyPage',
  componentsMeta: [],
  componentsTree: {
    componentName: InnerComponentNameEnum.ROOT_CONTAINER,
    props: {},
    children: [],
  },
};
