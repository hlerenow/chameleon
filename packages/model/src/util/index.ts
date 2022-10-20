import { CNodePropsTypeEnum } from '../const/schema';
import { CPage } from '../Page';
import { CSchema } from '../Page/Schema';
import { CNode } from '../Page/Schema/Node';
import { CProp } from '../Page/Schema/Node/prop';

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
