import { merge, omit } from 'lodash-es';
import { CPage } from '..';
import { ExportType, ExportTypeEnum } from '../../const/schema';
import { CMaterials } from '../../Material';
import {
  CSchemaDataType,
  CSchemaDataTypeDescribe,
  InnerComponentNameEnum,
} from '../../types/schema';
import { clearSchema, getNode, getRandomStr } from '../../util';
import { checkComplexData } from '../../util/dataCheck';
import { isArray, isPlainObject } from '../../util/lodash';
import { DataModelEmitter, DataModelEventType } from '../../util/modelEmitter';
import { CNode } from './Node/index';
import { CProp } from './Node/prop';

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
  data: CSchemaDataType | CSchemaModelDataType,
  parent: CSchema,
  materials: CMaterials
): CSchemaModelDataType => {
  const res: CSchemaModelDataType = {
    ...data,
    id: getRandomStr(),
    props: {} as any,
    componentName: InnerComponentNameEnum.PAGE,
    children: [],
    configure: merge(data.configure || {}, {
      propsSetter: {},
      advanceSetter: {},
    }),
  };
  let child: any = [];
  if (isArray(data.children)) {
    child = data.children.map((el: any) => {
      if (el instanceof CNode) {
        return el;
      }
      if (isPlainObject(el)) {
        return new CNode(el, { parent: parent, materials });
      } else {
        return el;
      }
    });
  } else {
    if ((data.children as unknown) instanceof CNode) {
      child.push(data.children);
    } else {
      if (data.children && isPlainObject(data.children)) {
        child.push(new CNode(data.children, { parent: parent, materials }));
      }
    }
  }

  const propsKeys = Object.keys(data.props || {});

  if (propsKeys.length) {
    propsKeys.forEach((propKey) => {
      const targetProps = data.props?.[propKey];
      if (targetProps instanceof CProp) {
        res.props[propKey] = targetProps;
      } else {
        res.props[propKey] = new CProp(propKey, targetProps || '', {
          parent: parent,
          materials,
        });
      }
    });
  }
  res.children = child;

  return res;
};

type OnNodeChangeType = (params: DataModelEventType['onNodeChange']) => void;

export class CSchema {
  private rawData: CSchemaDataType;
  private data: CSchemaModelDataType;
  nodeType = 'SCHEMA';
  emitter = DataModelEmitter;
  materialsModel: CMaterials;
  listenerHandle: (() => void)[];
  onChangeCbQueue: OnNodeChangeType[];
  parent: CPage;
  constructor(
    data: any,
    { parent, materials }: { parent: CPage; materials: CMaterials }
  ) {
    this.materialsModel = materials;
    this.rawData = JSON.parse(JSON.stringify(data));
    this.data = parseSchema(data, this, materials);
    this.listenerHandle = [];
    this.onChangeCbQueue = [];
    this.registerListener();
    this.parent = parent;
  }

  registerListener() {
    const onNodeChange = (params: DataModelEventType['onNodeChange']) => {
      const { node } = params;
      if (node === this && node.id === this.id) {
        this.onChangeCbQueue.forEach((it) => it(params));
      }
    };
    this.emitter.on('onNodeChange', onNodeChange);
    this.listenerHandle.push(() => {
      this.emitter.off('onNodeChange', onNodeChange);
    });
  }

  onChange(cb: OnNodeChangeType) {
    this.onChangeCbQueue.push(cb);
    return () => {
      this.onChangeCbQueue = this.onChangeCbQueue.filter((el) => el !== cb);
    };
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
    const materialModel = this.materialsModel;
    return materialModel?.findByComponentName(this.data.componentName);
  }

  updateValue(val?: CSchemaModelDataType) {
    const oldData = this.data;
    const newVal = {
      ...this.data,
      ...val,
    };
    this.data = parseSchema(newVal, this, this.materialsModel);
    this.emitter.emit('onNodeChange', {
      value: this.data,
      preValue: oldData,
      node: this,
    });
  }
  contains(nodeId: string) {
    const res = getNode(this, nodeId);
    return res;
  }

  export(mode: ExportType = ExportTypeEnum.SAVE): CSchemaDataType {
    const data = this.data;
    const props: any = {};
    Object.keys(data.props || {}).forEach((key) => {
      props[key] = data.props[key].export(mode);
    });
    const children: any[] =
      data.children?.map((child) => {
        return child?.export?.(mode);
      }) || [];

    const tempData: CSchemaDataType = {
      ...data,
      props: props,
      children: children.filter((el) => el),
    };
    let finalRes: any = omit(tempData, ['id']);
    finalRes = clearSchema(finalRes);

    return finalRes;
  }
}
