import { DropPosType } from '@chameleon/layout/dist/components/DropAnchor/util';
import {
  CNodeDataType,
  CPage,
  CPageDataType,
  getMTitle,
  isJSSlotPropNode,
  RenderPropType,
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
    };
    const props = node.props || {};

    const processProps = (val: unknown, key: string, keys: string[]) => {
      const flag = isJSSlotPropNode(val);

      if (flag) {
        const tempVal = val as RenderPropType;
        const propsTitle = pageModel.getNode(node.id!)?.props[key]?.material
          ?.title;
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
        Object.keys(tempVal).forEach((key) => {
          processProps(tempVal[key], key, [...keys, key]);
        });
      }
      if (Array.isArray(val)) {
        const tempVal = val as any[];
        tempVal.forEach((item, index) => {
          processProps(item, String(index), [...keys, String(index)]);
        });
      }
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
