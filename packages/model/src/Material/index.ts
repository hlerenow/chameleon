import { CNode } from '../Schema/Node';
import { CMaterialTypeDescribe } from '../types/material';
import { isArray } from '../util/lodash';
import { checkComplexData } from '../util/dataCheck';

const parseMaterial = (data: any[]) => {
  return data;
};

class CMaterial {
  originData: any;
  data: CNode[];
  constructor(data: any) {
    this.originData = data;
    this.data = parseMaterial(data);
  }
}

const parseMaterials = (data: any[]) => {
  if (!isArray(data)) {
    throw new Error('Materials must be a array');
  }
  return data.map((el) => {
    return new CMaterial(el);
  });
};

export const checkMaterials = (data: any) => {
  // check page children
  data?.forEach((it: any) => {
    checkComplexData({
      data: it,
      dataStruct: CMaterialTypeDescribe,
      throwError: true,
    });
  });
};
export class CMaterials {
  originData: any;
  data: CMaterial[];
  constructor(data: any) {
    this.originData = data;
    checkMaterials(data);
    this.data = parseMaterials(data);
  }
}
