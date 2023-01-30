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

  const tb = (node: CNodeDataType): TreeNodeData => {
    let nodeChild: any[] = node.children || [];
    if (!Array.isArray(nodeChild)) {
      // TODO: 暂时不处理字符串的情况
      nodeChild = [];
    }

    nodeChild = nodeChild.filter((el) => typeof el !== 'string');

    // 还需要处理 props 中的节点
    return {
      title: node.title || node.componentName,
      key: node.id,
      children: nodeChild.map((el) => tb(el)) || [],
    };
  };

  return [
    {
      title: 'Page',
      key: tree.id || 'Page',
      children: child.map((el) => tb(el)),
    },
  ];
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
