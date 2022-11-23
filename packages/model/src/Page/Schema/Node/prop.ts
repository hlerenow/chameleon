import { CNode } from '.';
import { CSchema } from '..';
import { CNodePropsTypeEnum, ExportType } from '../../../const/schema';
import { CMaterials } from '../../../Material';
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
  CPropDataType,
  CPropObjDataType,
} from '../../../types/node';
import { isArray, isPlainObject } from '../../../util/lodash';
import { DataModelEmitter } from '../../../util/modelEmitter';
import { CJSSlotPropDataType, CSlot } from './slot';

export type CSpecialPropDataType =
  | CJSSlotPropDataType
  | FunctionPropType
  | JSExpressionPropType;

export type CPropModelDataType =
  | NormalPropType
  | CSpecialPropDataType
  | CSpecialPropDataType[];

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

// TODO: 需要递归处理每个节点，将特殊节点转换为 CProp Model
const handleObjProp = (
  data: any,
  parent: ParentType,
  materials?: CMaterials | null
): any => {
  if (data.type) {
    if (data.type === CNodePropsTypeEnum.SLOT) {
      // 转换为 Slot Node
      const newNode = new CSlot(data, { parent, materials });
      return newNode;

      // return newData;
    }
    return data;
  } else if (isPlainObject(data)) {
    const newData: CPropDataType = {};
    Object.keys(data).forEach((key) => {
      newData[key] = parseData(data[key], parent);
    });
    return newData;
  } else if (Array.isArray(data)) {
    return data.map((el) => handleObjProp(el, parent, materials));
  } else {
    return data;
  }
};
type ParentType = CProp | null;

// 递归处理所有的节点
const parseData = (
  data: any,
  parent: ParentType,
  materials?: CMaterials | null
) => {
  if (isPlainObject(data)) {
    return handleObjProp(data, parent, materials);
  }
  if (isArray(data)) {
    return data.map((el) => handleObjProp(el, parent, materials));
  }
  return data;
};

export class CProp {
  nodeType = 'PROP';
  private rawData: CPropDataType;
  parent: CNode | CSchema | null;
  emitter = DataModelEmitter;
  private data: CPropModelDataType;
  name: string;
  materialsMode: CMaterials | undefined | null;
  constructor(
    name: string,
    data: CPropDataType,
    {
      parent,
      materials,
    }: { parent: CNode | CSchema | null; materials?: CMaterials | null }
  ) {
    this.materialsMode = materials;
    this.parent = parent;
    this.rawData = data;
    this.name = name;
    this.data = parseData(data, this, materials);
  }
  // TODO:
  isIncludeSlot() {
    return false;
  }
  // TODO:
  isIncludeExpression() {
    return false;
  }

  get value() {
    return this.data;
  }

  updateValue(val?: CPropDataType | CPropModelDataType) {
    const oldData = this.data;
    this.data = parseData(val ?? oldData, this);
    this.emitter.emit('onPropChange', {
      value: this.data,
      preValue: oldData,
      node: this,
    });
    // 排除 CSlot 类型
    if (this.parent && !(this.parent instanceof CSlot)) {
      this.emitter.emit('onNodeChange', {
        value: this.parent.value,
        preValue: this.parent.value,
        node: this.parent,
      });
    }
  }

  get material() {
    const parent = this.parent;
    if (parent instanceof CNode) {
      const parentMaterial = parent.material;
      const allProps = flatProps(parentMaterial?.value.props || []);
      const target = allProps.find((el) => el.name === this.name);
      return target;
    } else {
      return null;
    }
  }

  export(mode: ExportType): any {
    const data = this.data;
    const handleSingleProps = (propVal: any) => {
      if (propVal instanceof CProp) {
        return propVal.export(mode);
      }
      if (propVal instanceof CSlot) {
        return propVal.export(mode);
      }

      if (propVal instanceof CNode) {
        return propVal.export(mode);
      }

      if (isArray(propVal)) {
        const newList: any[] = propVal.map((el) => {
          return handleSingleProps(el);
        });
        return newList;
      }

      if (isPlainObject(propVal)) {
        const newObj: Record<string, any> = {};

        Object.keys(propVal || {}).forEach((key) => {
          newObj[key] = handleSingleProps(propVal[key]);
        });
        return newObj;
      }

      return propVal;
    };
    return handleSingleProps(data);
  }
}

export const transformObjToPropsModelObj = (
  props: CPropObjDataType,
  parent: CNode | null = null
) => {
  const newProps: Record<string, CPropModelDataType> = {};
  const propsKeys = Object.keys(props || {});
  if (propsKeys.length) {
    propsKeys.forEach((propKey) => {
      newProps[propKey] = new CProp(propKey, props[propKey], {
        parent: parent,
      });
    });
  }
  return newProps;
};
