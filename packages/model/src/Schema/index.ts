import { isArray, isPlainObject } from '../util/lodash';
import { checkNode, CNode } from './Node';

export const checkSchema = (data: any) => {
  let originData: any[] = [];
  if (isPlainObject(data)) {
    originData = [data];
  } else {
    originData = data;
  }

  originData.forEach((el) => {
    checkNode(el);
  });
};

export const parseSchema = (data: any): CNode[] => {
  let res = [];
  if (!isArray(data)) {
    res = data.map((el: any) => {
      return new CNode(el);
    });
  } else {
    res.push(new CNode(data));
  }

  return res;
};

export class CSchema {
  originData: any;
  data: CNode[];
  constructor(data: any) {
    this.originData = data;
    this.data = parseSchema(data);
  }
}
