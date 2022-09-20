import { CNode } from '.';
import { CSchema } from '..';
import { CNodePropsTypeEnum, ExportType } from '../../../const/schema';
import {
  CMaterialPropsType,
  MaterialPropType,
  PropsUIType,
  SpecialMaterialPropType,
} from '../../../types/material';
import {
  FunctionPropType,
  JSExpressionPropType,
  NormalPropType,
  PropType,
  RenderPropType,
} from '../../../types/node';
import { isArray, isPlainObject } from '../../../util/lodash';
import { DataModelEmitter } from '../../../util/modelEmitter';

const flatProps = (props: CMaterialPropsType): MaterialPropType[] => {
  let allProps: MaterialPropType[] = [];
  props.forEach((el) => {
    const specialProp = el as SpecialMaterialPropType;
    if (specialProp.type) {
      if (specialProp.type === PropsUIType.SINGLE) {
        allProps.push(specialProp.content);
      } else if (specialProp.type === PropsUIType.GROUP) {
        allProps = [...allProps, ...flatProps(specialProp.content)];
      }
    } else {
      allProps.push(el as MaterialPropType);
    }
  });

  return allProps;
};

const handleObjProp = (data: any) => {
  if (data.type) {
    if (data.type === CNodePropsTypeEnum.SLOT) {
      const tempData = data as RenderPropType;
      const newData = {
        type: data.type,
        value: tempData.value?.map((el) => new CNode(el)) || [],
      };
      return newData;
    }
    return data;
  } else {
    const newData: CPropDataType = {};
    Object.keys(data).forEach((key) => {
      newData[key] = parseData(data[key]);
    });
    return newData;
  }
};

const parseData = (data: any) => {
  if (isPlainObject(data)) {
    return handleObjProp(data);
  }

  if (isArray(data)) {
    return data.map((el) => handleObjProp(el));
  }

  return data;
};

export type CSpecialPropDataType =
  | {
      type: CNodePropsTypeEnum.SLOT;
      value: CNode | CNode[];
    }
  | FunctionPropType
  | JSExpressionPropType;

export type CPropDataType =
  | NormalPropType
  | CSpecialPropDataType
  | CSpecialPropDataType[];

export class CProp {
  modeType = 'PROP';
  private rawData: PropType;
  parent: CNode | CSchema;
  emitter = DataModelEmitter;
  private data: CPropDataType;
  name: string;
  constructor(
    name: string,
    data: any,
    { parent }: { parent: CNode | CSchema }
  ) {
    this.parent = parent;
    this.rawData = data;
    this.name = name;
    this.data = parseData(data);
  }

  isSlot() {
    if (isArray(this.data) && this.data?.length) {
      return this.data[0].type === CNodePropsTypeEnum.SLOT;
    } else if (isPlainObject(this.data)) {
      return (this.data as Record<any, any>).type === CNodePropsTypeEnum.SLOT;
    }
    return false;
  }

  isExpression() {
    if (isArray(this.data) && this.data?.length) {
      return this.data[0].type === CNodePropsTypeEnum.EXPRESSION;
    } else if (isPlainObject(this.data)) {
      return (
        (this.data as Record<any, any>).type === CNodePropsTypeEnum.EXPRESSION
      );
    }
    return false;
  }

  get value() {
    return this.data;
  }

  set value(val) {
    this.emitter.emit('onPropChange', { value: val, preValue: this.data });
    this.emitter.emit('onNodeChange', {
      value: this.parent.export(),
      preValue: this.parent.export(),
    });
    this.emitter.emit('onSchemaChange');
    this.emitter.emit('onPageChange');
    this.data = val;
  }

  get material() {
    const parentMaterial = this.parent.material;
    const allProps = flatProps(parentMaterial?.value.props || []);
    const target = allProps.find((el) => el.name === this.name);
    return target;
  }

  export(mode: ExportType) {
    return this.data;
  }
}
