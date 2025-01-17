import { TreeDataNode } from 'antd';
import { Key } from 'react';

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

export const generateKeyList = (data: TreeDataNode[]) => {
  let dataList: { title: string; key: Key }[] = [];
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { key } = node;
    dataList.push({ key, title: node.title as string });
    if (node.children) {
      const res = generateKeyList(node.children);
      dataList = [...dataList, ...res];
    }
  }

  return dataList;
};
