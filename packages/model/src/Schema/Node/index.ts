import { CNodeDataStructDescribe, CNodeDataType } from '../../types/node';
import { getRandomStr, isJSslotNode } from '../../util';
import { checkComplexData } from '../../util/dataCheck';
import { values } from '../../util/lodash';

export const checkNode = (data: any) => {
  const { props } = data;
  // check data
  checkComplexData({
    data: data,
    dataStruct: CNodeDataStructDescribe(),
    throwError: true,
  });
  // check props data struct which type is JSSLOT
  const jsslotValueArr = values(props)
    .filter(isJSslotNode)
    .map((el) => {
      return el.value;
    });

  jsslotValueArr.forEach((val) => {
    checkNode(val);
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
