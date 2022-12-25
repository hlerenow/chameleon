import {
  CNode,
  CPage,
  CProp,
  CSchema,
  CSlot,
  isNodeModel,
} from '@chameleon/model';

export const getCloseNodeList = (node: CNode | CSchema, level = 5) => {
  const res = [];
  let count = 0;
  let currentNode: CNode | CSchema | CSlot | CProp | CPage | null = node;

  while (count < level && currentNode) {
    if (isNodeModel(currentNode)) {
      res.push(currentNode);
      count++;
    }

    currentNode = currentNode.parent || null;
  }

  return res;
};
