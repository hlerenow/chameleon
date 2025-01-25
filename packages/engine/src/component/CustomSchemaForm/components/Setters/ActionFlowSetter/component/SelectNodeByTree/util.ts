import { TreeDataNode } from 'antd';

export const getParentKey = (key: React.Key, tree: TreeDataNode[]): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

export const getNodeInfo = (key: string, tree: TreeDataNode[]): TreeDataNode | null => {
  const traverse = (nodes: TreeDataNode[]): TreeDataNode | null => {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children?.length) {
        const result = traverse(node.children);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };

  return traverse(tree);
};
