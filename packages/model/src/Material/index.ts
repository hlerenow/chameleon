import { CMaterialType, CMaterialTypeDescribe } from '../types/material';
import { isArray } from '../util/lodash';
import { checkComplexData } from '../util/dataCheck';

const parseMaterial = (data: CMaterialType) => {
  return data;
};

export class CMaterial {
  private rawData: CMaterialType;
  private data: CMaterialType;
  constructor(data: CMaterialType) {
    this.rawData = data;
    this.data = parseMaterial(data);
  }

  get value() {
    return this.data;
  }

  get componentName() {
    return this.data.componentName;
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

export const checkMaterials = (data: CMaterialType[]) => {
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
  private rowData: CMaterialType[];
  private data: CMaterial[];
  constructor(data: any) {
    this.rowData = data;
    checkMaterials(data);
    this.data = parseMaterials(data);
  }

  findByComponentName(componentName: string) {
    const target = this.data.find((el) => el.componentName === componentName);
    return target;
  }

  get value() {
    return this.data;
  }
}
