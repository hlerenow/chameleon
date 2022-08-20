import { CSchemaDataType, CSchemaDataTypeDescribe } from '../types/schema';
import { checkComplexData } from '../util/dataCheck';
import { isArray } from '../util/lodash';
import { CNode } from './Node';

export const checkSchema = (data: any): CSchemaDataType => {
  checkComplexData({
    data: data,
    dataStruct: CSchemaDataTypeDescribe,
    throwError: true,
  });
  return data;
};

export const parseSchema = (data: CSchemaDataType) => {
  let res = [];
  if (isArray(data.children)) {
    res = data.children.map((el: any) => {
      return new CNode(el);
    });
  } else {
    res.push(new CNode(data.children));
  }
  return {
    ...data,
    children: res,
  };
};

export class CSchema {
  private originData: CSchemaDataType;
  private data: any;
  constructor(data: any) {
    this.originData = checkSchema(data);
    this.data = parseSchema(data);
  }

  export(mode: 'designer' | 'save' = 'save'): CSchemaDataType {
    return this.originData;
  }
}
