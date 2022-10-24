import { isPlainObject } from 'lodash-es';
import { CSchema } from '..';
import { ExportType } from '../../../const/schema';
import { CMaterials } from '../../../Material';
import { CNodeDataStructDescribe, CNodeDataType } from '../../../types/node';
import { getRandomStr, clearSchema } from '../../../util';
import { checkComplexData } from '../../../util/dataCheck';
import {
  DataModelEmitter,
  DataModelEventType,
} from '../../../util/modelEmitter';
import { CProp } from './prop';
import { CSlot } from './slot';

export const checkNode = (data: any) => {
  if (typeof data === 'string') {
    return true;
  }
  // check data
  checkComplexData({
    data: data,
    dataStruct: CNodeDataStructDescribe,
    throwError: true,
  });
};

export type CNodeModelDataType = Omit<CNodeDataType, 'children'> & {
  id: string;
  children: (CNode | string)[];
  props: Record<string, CProp>;
};

export const parseNode = (
  data: CNodeDataType | CNodeModelDataType,
  self: CNode | CSchema,
  materials?: CMaterials | null
) => {
  if (typeof data === 'string') {
    return data;
  }
  const res: CNodeModelDataType = {
    ...data,
    id: data.id ?? getRandomStr(),
    children: [],
    props: {},
  };

  const propsKeys = Object.keys(data.props || {});
  if (propsKeys.length) {
    propsKeys.forEach((propKey) => {
      if (res.props[propKey] instanceof CProp) {
        return;
      }
      res.props[propKey] = new CProp(propKey, data.props?.[propKey] || '', {
        parent: self,
        materials,
      });
    });
  }

  if (data.children) {
    if (Array.isArray(data.children)) {
      res.children = data.children.map((el) => {
        if (el instanceof CNode) {
          return el;
        }
        if (isPlainObject(el)) {
          const tmpObj = el as CNodeDataType;
          return new CNode(tmpObj, {
            parent: self,
            materials,
          });
        } else {
          return el as string;
        }
      });
    } else {
      if ((data.children as any) instanceof CNode) {
        res.children = [data.children];
      }
      res.children = [
        new CNode(data.children, {
          parent: self,
          materials,
        }),
      ];
    }
  }
  return res;
};

type OnNodeChangeType = (params: DataModelEventType['onNodeChange']) => void;
type ParentType = CNode | CSchema | CSlot | null;

export class CNode {
  nodeType = 'NODE';
  private rawData: CNodeDataType;
  private data: CNodeModelDataType;
  emitter = DataModelEmitter;
  parent: ParentType;
  materialsModel: CMaterials | null;
  listenerHandle: (() => void)[];
  onChangeCbQueue: OnNodeChangeType[];

  constructor(
    data: CNodeDataType,
    options?: { parent?: ParentType; materials?: CMaterials | null }
  ) {
    this.rawData = JSON.parse(JSON.stringify(data));
    checkNode(data);
    this.parent = options?.parent || null;
    this.materialsModel = options?.materials || null;
    this.data = parseNode(data, this, options?.materials);
    this.listenerHandle = [];
    this.onChangeCbQueue = [];
    this.registerListener();
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

  destroy() {
    this.listenerHandle.forEach((it) => it());
  }

  get id() {
    return this.data.id;
  }

  get value(): CNodeModelDataType {
    return this.data;
  }

  clone(id?: string) {
    const newData = {
      ...this.export(),
      id: id || getRandomStr(),
    };
    return new CNode(newData);
  }

  updateValue(val?: Partial<CNodeModelDataType>) {
    const oldData = this.data;
    const newVal: CNodeModelDataType = {
      ...this.data,
      ...val,
    };

    this.data = parseNode(newVal, this);
    this.emitter.emit('onNodeChange', {
      value: newVal,
      preValue: oldData,
      node: this,
    });
  }

  get props() {
    return this.data.props;
  }

  get material() {
    const materialModel = this.materialsModel;
    return materialModel?.findByComponentName(this.data.componentName);
  }

  export(mode?: ExportType): CNodeDataType {
    const data = this.data;
    if (typeof data === 'string') {
      return data;
    }
    const props: any = {};
    Object.keys(data.props || {}).forEach((key) => {
      props[key] = data.props[key].export(mode);
    });
    const children: any[] = data.children?.map((child) => {
      if (child instanceof CNode) {
        return child.export();
      } else {
        return child;
      }
    });

    let newRes = {
      ...data,
      props: props,
      children,
    };

    newRes = clearSchema(newRes);
    return newRes;
  }
}
