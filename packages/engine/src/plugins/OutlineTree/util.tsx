import React from 'react';
import { DropPosType } from '@chameleon/layout/dist/components/DropAnchor/util';
import {
  CNode,
  CNodeDataType,
  CPage,
  CPageDataType,
  getMTitle,
  isJSSlotPropNode,
  isSpecialMaterialPropType,
  MaterialPropType,
  MTitle,
  RenderPropType,
  SetterObjType,
  SetterType,
} from '@chameleon/model';
import { isPlainObject } from 'lodash-es';
import { TreeNodeData } from './components/TreeView/dataStruct';

export const getTargetMNodeKeyVal = (
  dom: HTMLElement | null,
  key: string
): null | string => {
  if (!dom) {
    return null;
  }
  const val = dom.getAttribute(key);
  if (!val) {
    return getTargetMNodeKeyVal(dom.parentElement, key);
  } else {
    return val;
  }
};

export const transformNodeSchemaToTreeData = (
  nodeSchema: CNodeDataType | CNodeDataType[],
  parent: TreeNodeData,
  pageModel: CPage
): TreeNodeData | TreeNodeData[] => {
  const tb = (
    node: CNodeDataType,
    parent?: TreeNodeData | null
  ): TreeNodeData => {
    let nodeChild: any[] = node.children || [];
    if (!Array.isArray(nodeChild)) {
      // TODO: 暂时不处理字符串的情况
      nodeChild = [];
    }
    // 过滤掉字符串的情况
    nodeChild = nodeChild.filter((el) => typeof el !== 'string');
    const newCurrentNode: TreeNodeData = {
      title: node.title || node.componentName,
      key: node.id,
      children: [],
      parent: parent,
    };
    // 还需要处理 props 中的节点
    const propsNodeList: TreeNodeData[] = [];
    const slotNode: TreeNodeData = {
      title: 'SLOT',
      key: `${node.id}-SLOT`,
      children: propsNodeList,
      canBeSelected: false,
      canDrop: false,
      parent: null,
      containerRender: ({ treeNodeView }) => {
        return (
          <div
            style={{
              border: '1px solid #a97cf8',
              borderTopWidth: '6px',
              marginRight: '2px',
              marginTop: '5px',
            }}
          >
            {treeNodeView}
          </div>
        );
      },
    };
    const props = node.props || {};

    const processProps = (val: unknown, key: string, keys: string[]) => {
      const flag = isJSSlotPropNode(val);

      if (flag) {
        const tempVal = val as RenderPropType;
        // debugger;
        const pageModeNode = pageModel.getNode(node.id!);
        let propsTitle = '';
        if (pageModeNode) {
          propsTitle = getPropsLabel(pageModeNode as CNode, [...keys, key]);
        }
        let plainTitle = key;
        if (propsTitle) {
          plainTitle = getMTitle(propsTitle) || key;
        }
        const tempNode: TreeNodeData = {
          title: plainTitle,
          key: `${node.id}-${keys.join('_')}`,
          children: [],
          canBeSelected: false,
          canDrag: false,
          canDrop: ['current'],
          parent: slotNode,
        };

        let propValue: CNodeDataType[] = [];
        if (tempVal.value && !Array.isArray(tempVal.value)) {
          propValue = [tempVal.value];
        } else {
          propValue = tempVal.value;
        }

        tempNode.children = transformNodeSchemaToTreeData(
          propValue,
          tempNode,
          pageModel
        ) as TreeNodeData[];
        propsNodeList.push(tempNode);
        return;
      }
      if (isPlainObject(val)) {
        const tempVal = val as any;
        Object.keys(tempVal).forEach((newKey) => {
          processProps(tempVal[newKey], newKey, [...keys, key]);
        });
      }
      if (Array.isArray(val)) {
        const tempVal = val as any[];
        tempVal.forEach((item, index) => {
          processProps(item, String(index), [...keys, key]);
        });
      }
    };
    const getPropsLabel = (nodeModel: CNode, keyPath: string[]) => {
      const propsLabelMap = getNodePropsLabelMap(nodeModel);
      const newKeyPath = keyPath.map((el) => {
        if (String(parseInt(el, 10)) === el) {
          return '$NUM';
        } else {
          return el;
        }
      });
      return propsLabelMap[newKeyPath.join('.')] || '';
    };

    Object.keys(props).forEach((key) => {
      processProps(props[key], key, []);
    });

    if (propsNodeList.length > 0) {
      newCurrentNode.children?.push(slotNode);
      slotNode.parent = newCurrentNode;
    }
    const childNodeList = nodeChild.map((el) => tb(el, newCurrentNode)) || [];
    newCurrentNode.children = [...newCurrentNode.children!, ...childNodeList];
    return newCurrentNode;
  };

  if (Array.isArray(nodeSchema)) {
    return nodeSchema.map((el) => {
      return tb(el, parent);
    });
  } else {
    return tb(nodeSchema, parent);
  }
};

export const transformPageSchemaToTreeData = (
  pageSchema: CPageDataType,
  pageModel: CPage
): TreeNodeData[] => {
  const tree = pageSchema.componentsTree;
  let child = (tree.children || []) as CNodeDataType[];
  if (!Array.isArray(child)) {
    child = [];
  }

  const rootNode: TreeNodeData = {
    title: 'Page',
    key: tree.id || 'Page',
    children: [],
  };
  rootNode.children = transformNodeSchemaToTreeData(
    child,
    rootNode,
    pageModel
  ) as TreeNodeData[];
  return [rootNode];
};

export const traverseTree = (
  tree: TreeNodeData | TreeNodeData[],
  handler: (node: TreeNodeData) => boolean
) => {
  let tempTree: TreeNodeData[] = [];
  if (Array.isArray(tree)) {
    tempTree = tree;
  } else {
    tempTree = [tree];
  }

  let stop = false;

  const traverseCb = (
    node: TreeNodeData,
    conditionCb: (node: TreeNodeData) => boolean
  ) => {
    if (stop) {
      return;
    }
    const res = conditionCb(node);
    if (res) {
      stop = true;
    } else {
      node.children?.forEach((el) => {
        traverseCb(el, conditionCb);
      });
    }
  };
  tempTree.forEach((el) => {
    traverseCb(el, handler);
  });
};

export function calculateDropPosInfo(params: {
  point: { x: number; y: number };
  dom: HTMLElement;
}): DropPosType {
  const { point, dom } = params;
  let pos: DropPosType['pos'];

  const mousePos = point;
  const targetRect = dom.getBoundingClientRect();
  const targetDomH = targetRect.height;
  const xCenter = targetRect.x + 50;
  const yCenter = targetRect.y + Math.round(targetDomH / 2);

  if (mousePos.y > yCenter) {
    pos = 'after';
  } else {
    pos = 'before';
  }

  if (mousePos.x > xCenter && pos == 'after') {
    pos = 'current';
  }

  return {
    pos,
    direction: 'vertical',
  };
}

//TODO:  移动到 model 包中去
export const getNodePropsLabelMap = (node: CNode) => {
  const resMap: Record<string, MTitle> = {};
  const props = node.material?.value.props;
  if (!props) {
    return resMap;
  }
  const singleProcessUnit = (val: SetterType, paths: string[]) => {
    if (isPlainObject(val)) {
      const newPaths = [...paths];
      const objSetter = val as SetterObjType;
      const componentName = objSetter.componentName;
      if (componentName === 'ArraySetter') {
        const arrItemSetter = objSetter.props?.item.setters || [];
        const parentTitle = resMap[paths.join('.')];
        let currentTitle = '';
        if (typeof parentTitle === 'string') {
          currentTitle = parentTitle;
        } else {
          currentTitle = parentTitle.label;
        }
        newPaths.push('$NUM');
        arrItemSetter.forEach((el) => {
          currentTitle = `${currentTitle}`;
          resMap[newPaths.join('.')] = currentTitle;
          singleProcessUnit(el, newPaths);
        });
      } else if (componentName === 'ShapeSetter') {
        const elements = objSetter.props?.elements || [];
        elements.forEach((it) => {
          const newObjPaths = [...newPaths];
          newObjPaths.push(it.name);
          resMap[newObjPaths.join('.')] = it.title;
          const subSetter = it.setters || [];
          subSetter.forEach((it2) => {
            singleProcessUnit(it2, [...newObjPaths]);
          });
        });
      }
    }
  };

  props.forEach((item) => {
    let targetItem: MaterialPropType | MaterialPropType[] | null = null;
    if (isSpecialMaterialPropType(item)) {
      targetItem = item.content;
    } else {
      targetItem = item;
    }
    let itemArr: MaterialPropType[] = [];
    if (Array.isArray(targetItem)) {
      itemArr = targetItem;
    } else {
      itemArr = [targetItem];
    }

    itemArr.forEach((it) => {
      const newPaths: string[] = [it.name];
      resMap[newPaths.join('.')] = it.title;
      it.setters?.forEach((it2) => {
        singleProcessUnit(it2, newPaths);
      });
    });
  });

  return resMap;
};
