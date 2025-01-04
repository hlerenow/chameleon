import { isArray, isPlainObject, omitBy } from 'lodash-es';
import { CNodePropsTypeEnum } from '../const/schema';
import { CPage } from '../Page';
import { CRootNode } from '../Page/RootNode';
import { CNode } from '../Page/RootNode/Node';
import { CProp } from '../Page/RootNode/Node/prop';
import { CSlot } from '../Page/RootNode/Node/slot';
import { InnerComponentNameEnum } from '../types/rootNode';
import { FunctionPropType, JSExpressionPropType, RenderPropType } from '../types/node';

export const isExpression = (val: any): val is JSExpressionPropType => {
  if (val?.type === CNodePropsTypeEnum.EXPRESSION) {
    return true;
  } else {
    return false;
  }
};

export const isJSSlotPropNode = (val: any): val is RenderPropType => {
  if (val?.type === CNodePropsTypeEnum.SLOT) {
    return true;
  } else {
    return false;
  }
};

export const isFunction = (val: any): val is FunctionPropType => {
  if (val?.type === CNodePropsTypeEnum.FUNCTION) {
    return true;
  } else {
    return false;
  }
};

export const isAction = (val: any): val is FunctionPropType => {
  if (val?.type === CNodePropsTypeEnum.ACTION) {
    return true;
  } else {
    return false;
  }
};

export const getRandomStr = () => {
  return Math.random().toString(32).slice(3, 9);
};

export const isSchemaModel = (val: any): val is CRootNode => {
  if (val?.nodeType === 'SCHEMA' && val instanceof CRootNode) {
    return true;
  }

  return false;
};

export const isPageModel = (val: any): val is CPage => {
  if (val?.nodeType === InnerComponentNameEnum.ROOT_CONTAINER) {
    return true;
  }

  return false;
};

export const isNodeModel = (val: any): val is CNode => {
  if (val?.nodeType === 'NODE') {
    return true;
  }

  return false;
};

export const isPropModel = (val: any): val is CProp => {
  if (val?.nodeType === 'PROP') {
    return true;
  }
  return false;
};

export const isSlotModel = (val: any): val is CSlot => {
  if (val?.nodeType === 'SLOT') {
    return true;
  }
  return false;
};

/**
 *
 * @param res clear empty array and object
 */
export const clearSchema = (res: any) => {
  const newRes: any = omitBy(res, (val) => {
    if (isPlainObject(val)) {
      return !Object.keys(val).length;
    }
    if (isArray(val)) {
      return !val.length;
    }
    return !val;
  });
  return newRes;
};

export function findNode(nodeTree: CRootNode | CNode, iterator: (item: CNode | CRootNode) => boolean) {
  const nodeList: (CRootNode | CNode)[] = [nodeTree];
  while (nodeList.length) {
    const target = nodeList.shift();
    if (target && iterator(target)) {
      return target;
    }

    const props = target?.props || {};

    const dpProps = (prop: unknown) => {
      if (prop instanceof CNode) {
        nodeList.push(prop);
        return;
      }

      if (prop instanceof CSlot) {
        dpProps(prop.value.value);
      }

      if (prop instanceof CProp) {
        dpProps(prop.value);
        return;
      }
      if (isPlainObject(prop)) {
        const obj = prop as Record<string, any>;
        Object.keys(obj).forEach((key) => {
          dpProps(obj[key]);
        });
        return;
      }

      if (isArray(prop)) {
        prop.forEach((it) => {
          dpProps(it);
        });
        return;
      }
    };

    // 检索所有的 props 中的节点
    dpProps(props);
    // 合并入待索引的列表
    const tempNodeList: CNode[] = (target?.value.children.filter((el) => el instanceof CNode) as CNode[]) || [];
    nodeList.push(...tempNodeList);
  }
  return undefined;
}

export function getNode(nodeTree: CRootNode | CNode, id: string) {
  return findNode(nodeTree, (node) => node.id === id);
}

export function findContainerNode(
  node: CNode | CRootNode | CSlot | CPage | null | undefined
): CNode | CRootNode | CSlot | CPage | undefined {
  if (!node) return undefined;
  if (isSlotModel(node) || isPageModel(node) || node.isContainer()) {
    return node;
  }
  return findContainerNode(node.parent);
}
