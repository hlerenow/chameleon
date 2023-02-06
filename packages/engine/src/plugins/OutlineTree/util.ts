import { DropPosType } from '@chameleon/layout/dist/components/DropAnchor/util';
import { CNodeDataType } from '@chameleon/model';
import { CPageDataType } from '@chameleon/model';
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

export const transformPageSchemaToTreeData = (
  pageSchema: CPageDataType
): TreeNodeData[] => {
  const tree = pageSchema.componentsTree;
  let child = (tree.children || []) as CNodeDataType[];
  if (!Array.isArray(child)) {
    child = [];
  }

  const tb = (
    node: CNodeDataType,
    parent?: TreeNodeData | null
  ): TreeNodeData => {
    let nodeChild: any[] = node.children || [];
    if (!Array.isArray(nodeChild)) {
      // TODO: 暂时不处理字符串的情况
      nodeChild = [];
    }

    nodeChild = nodeChild.filter((el) => typeof el !== 'string');

    // 还需要处理 props 中的节点

    const newCurrentNode: TreeNodeData = {
      title: node.title || node.componentName,
      key: node.id,
      children: [],
      parent: parent,
    };

    newCurrentNode.children =
      nodeChild.map((el) => tb(el, newCurrentNode)) || [];

    return newCurrentNode;
  };

  const rootNode: TreeNodeData = {
    title: 'Page',
    key: tree.id || 'Page',
    children: [],
  };

  rootNode.children = child.map((el) => tb(el, rootNode));

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
