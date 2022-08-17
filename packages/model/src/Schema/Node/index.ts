import { CNodeDataStructDescribe, CNodeDataType } from '../../types/node';
import { getRandomStr } from '../../util';
import { checkComplexData } from '../../util/dataCheck';

export const checkNode = (data: any) => {
  // check data
  checkComplexData({
    data: data,
    dataStruct: CNodeDataStructDescribe,
    throwError: true,
  });
};

export class CNode {
  data: CNodeDataType;
  constructor(data: any) {
    checkNode(data);
    this.data = data;
    this.data.id = this.data.id ?? getRandomStr();
  }
}
