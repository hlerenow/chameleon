import { isArray, isPlainObject, omitBy } from 'lodash-es';
import { CNodePropsTypeEnum } from '../const/schema';
import { CPage } from '../Page';
import { CSchema } from '../Page/Schema';
import { CNode } from '../Page/Schema/Node';
import { CProp } from '../Page/Schema/Node/prop';
import { CSlot } from '../Page/Schema/Node/slot';

export const isExpression = (arg: any) => {
  if (arg?.type === CNodePropsTypeEnum.EXPRESSION) {
    return true;
  } else {
    return false;
  }
};

export const isJSSlotPropNode = (arg: any) => {
  if (arg?.type == CNodePropsTypeEnum.SLOT) {
    return true;
  } else {
    return false;
  }
};

export const isFunction = (arg: any) => {
  if (arg?.type == CNodePropsTypeEnum.FUNCTION) {
    return true;
  } else {
    return false;
  }
};

export const getRandomStr = () => {
  return Math.random().toString(32).slice(3, 9);
};

export const isSchemaModel = (val: any): val is CSchema => {
  if (val?.nodeType === 'SCHEMA' && val instanceof CSchema) {
    return true;
  }

  return false;
};

export const isPageModel = (val: any): val is CPage => {
  if (val?.nodeType === 'PAGE' && val instanceof CPage) {
    return true;
  }

  return false;
};

export const isNodeModel = (val: any): val is CNode => {
  if (val?.nodeType === 'NODE' && val instanceof CNode) {
    return true;
  }

  return false;
};

export const isPropModel = (val: any): val is CProp => {
  if (val?.nodeType === 'PROP' && val instanceof CProp) {
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

export function getNode(nodeTree: CSchema | CNode, id: string) {
  const nodeList: (CSchema | CNode)[] = [nodeTree];
  while (nodeList.length) {
    const target = nodeList.shift();
    if (target?.id === id) {
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
        Object.keys(obj).map((key) => {
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
    const tempNodeList: CNode[] =
      (target?.value.children.filter((el) => el instanceof CNode) as CNode[]) ||
      [];
    nodeList.push(...tempNodeList);
  }

  return null;
}
