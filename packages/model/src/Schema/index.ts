import { isPlainObject } from 'lodash-es';

export const parseSchema = (data: any) => {
  let originData: any[] = [];
  let res = [];
  if (isPlainObject(data)) {
    originData = [data];
  } else {
    originData = data;
  }

  res = originData.map((el) => {
    return new Node(el);
  });

  return res;
};

class CSchema {
  originData: any;
  constructor(data: any) {
    this.originData = data;
  }
}
