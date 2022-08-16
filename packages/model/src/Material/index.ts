import { CNode } from '../Schema/Node';
import { isArray } from '../util/lodash';

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
export class CMaterials {
  originData: any;
  data: CMaterial[];
  constructor(data: any) {
    this.originData = data;
    this.data = parseMaterials(data);
  }
}
