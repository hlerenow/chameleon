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
  CPropDataType,
  RenderPropType,
  CPropObjDataType,
} from '../../../types/node';
import { isJSSlotPropNode } from '../../../util';
import { isArray, isPlainObject } from '../../../util/lodash';
import { DataModelEmitter } from '../../../util/modelEmitter';

export type CJSSlotPropDataType = Omit<RenderPropType, 'value'> & {
  value: CNode | CNode[] | null;
};
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
const handleObjProp = (data: any): any => {
  if (data.type) {
    if (data.type === CNodePropsTypeEnum.SLOT) {
      const tempData = data as RenderPropType;
      const newData: CJSSlotPropDataType = {
        type: tempData.type,
        renderType: tempData.renderType,
        params: tempData.params,
        value: null,
      };
      if (Array.isArray(tempData.value)) {
        newData.value =
          tempData.value?.map((el) => {
            if (el instanceof CNode) {
              return el;
            }
            return new CNode(el);
          }) || [];
      } else {
        if ((tempData.value as unknown) instanceof CNode) {
          newData.value = tempData.value;
        } else {
          newData.value = new CNode(tempData.value);
        }
      }

      return newData;
    }
    return data;
  } else if (isPlainObject(data)) {
    const newData: CPropDataType = {};
    Object.keys(data).forEach((key) => {
      newData[key] = parseData(data[key]);
    });
    return newData;
  } else if (Array.isArray(data)) {
    return data.map((el) => handleObjProp(el));
  } else {
    return data;
  }
};

// 递归处理所有的节点
const parseData = (data: any) => {
  if (isPlainObject(data)) {
    return handleObjProp(data);
  }
  if (isArray(data)) {
    return data.map((el) => handleObjProp(el));
  }
  return data;
};

type ParentType = CNode | CSchema | null;

export class CProp {
  modeType = 'PROP';
  private rawData: CPropDataType;
  parent: ParentType;
  emitter = DataModelEmitter;
  private data: CPropModelDataType;
  name: string;
  constructor(
    name: string,
    data: CPropDataType,
    { parent }: { parent: ParentType }
  ) {
    this.parent = parent;
    this.rawData = data;
    this.name = name;
    this.data = parseData(data);
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
    this.data = parseData(val ?? oldData);
    this.emitter.emit('onPropChange', {
      value: this.data,
      preValue: oldData,
      node: this,
    });
    if (this.parent) {
      this.emitter.emit('onNodeChange', {
        value: this.parent.value,
        preValue: this.parent.value,
        node: this.parent,
      });
    }
  }

  get material() {
    const parentMaterial = this.parent?.material;
    const allProps = flatProps(parentMaterial?.value.props || []);
    const target = allProps.find((el) => el.name === this.name);
    return target;
  }

  export(mode?: ExportType) {
    const data = this.data;
    const handleSingleProps = (propVal: any) => {
      if (propVal instanceof CNode) {
        return propVal.export();
      }
      if (isPlainObject(propVal)) {
        const newObj: Record<string, any> = {};

        Object.keys(propVal || {}).forEach((key) => {
          newObj[key] = handleSingleProps(propVal[key]);
        });
        return newObj;
      }

      if (isArray(propVal)) {
        const newList: any[] = propVal.map((el) => {
          return handleSingleProps(el);
        });
        return newList;
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
