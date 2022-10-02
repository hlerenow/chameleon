import { CPage } from '..';
import { ExportType } from '../../const/schema';
import { CMaterials } from '../../Material';
import {
  CSchemaDataType,
  CSchemaDataTypeDescribe,
  InnerComponentNameEnum,
} from '../../types/schema';
import { getRandomStr } from '../../util';
import { checkComplexData } from '../../util/dataCheck';
import { isArray } from '../../util/lodash';
import { DataModelEmitter } from '../../util/modelEmitter';
import { CNode } from './Node/index';
import { CProp } from './Node/props';

export type CSchemaModelDataType = Omit<CSchemaDataType, 'children'> & {
  id: string;
  children: CNode[];
  props: Record<string, CProp>;
};

export const checkSchema = (data: any): CSchemaDataType => {
  checkComplexData({
    data: data,
    dataStruct: CSchemaDataTypeDescribe,
    throwError: true,
  });
  return data;
};

export const parseSchema = (
  data: CSchemaDataType,
  parent: CSchema
): CSchemaModelDataType => {
  const res: CSchemaModelDataType = {
    ...data,
    id: getRandomStr(),
    props: {} as any,
    componentName: InnerComponentNameEnum.PAGE,
    children: [],
  };
  let child: any = [];
  if (isArray(data.children)) {
    child = data.children.map((el: any) => {
      return new CNode(el, { parent });
    });
  } else {
    child.push(new CNode(data.children, { parent }));
  }

  const propsKeys = Object.keys(data.props || {});

  if (propsKeys.length) {
    propsKeys.forEach((propKey) => {
      res.props[propKey] = new CProp(propKey, data.props?.[propKey] || '', {
        parent: parent,
      });
    });
  }
  res.children = child;

  return res;
};

export class CSchema {
  modeType = 'SCHEMA';
  private rawData: CSchemaDataType;
  emitter = DataModelEmitter;
  private data: CSchemaModelDataType;
  materialModel: CMaterials;
  constructor(data: any, { parent }: { parent: CPage }) {
    this.materialModel = parent.materialModel;
    this.rawData = JSON.parse(JSON.stringify(data));
    this.data = parseSchema(data, this);
  }

  get id() {
    return this.data.id;
  }

  get value() {
    return this.data;
  }

  get props() {
    return this.data.props;
  }

  get material() {
    const materialModel = this.materialModel;
    return materialModel?.findByComponentName(this.data.componentName);
  }

  // 该节点是不是纯文本节点
  isText() {
    if (typeof this.data === 'string') {
      return true;
    } else {
      return false;
    }
  }

  export(mode: ExportType = ExportType.SAVE): CSchemaDataType {
    return this.rawData;
  }
}
