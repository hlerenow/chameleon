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
  console.log('🚀 ~ file: util.ts:22 ~ pageSchema', pageSchema);
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
      key: tree.id,
      children: child.map((el) => tb(el)),
    },
  ];
};
