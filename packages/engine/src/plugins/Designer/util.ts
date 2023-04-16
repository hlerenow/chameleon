import { CNode, CPage, CProp, CRootNode, CSlot, isNodeModel } from '@chamn/model';

export const getClosestNodeList = (node: CNode | CRootNode, level = 5) => {
  const res = [];
  let count = 0;
  let currentNode: CNode | CRootNode | CSlot | CProp | CPage | null = node;

  while (count < level && currentNode) {
    if (isNodeModel(currentNode)) {
      res.push(currentNode);
      count++;
    }

    currentNode = currentNode.parent || null;
  }

  return res;
};
