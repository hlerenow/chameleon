import { get, isPlainObject, merge } from 'lodash-es';
import { CRootNode } from '..';
import { ExportType } from '../../../const/schema';
import { CMaterials } from '../../../Material';
import { CNodeDataStructDescribe, CNodeDataType } from '../../../types/node';
import { getRandomStr, clearSchema, getNode } from '../../../util';
import { checkComplexData } from '../../../util/dataCheck';
import { DataModelEmitter } from '../../../util/modelEmitter';
import type { DataModelEventType } from '../../../util/modelEmitter';
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
    throwError: false,
  });
};

export type CNodeModelDataType = Omit<CNodeDataType, 'children'> & {
  id: string;
  children: (CNode | string)[];
  props: Record<string, CProp>;
  configure: Required<CNodeDataType>['configure'];
};

export const parseNode = (
  data: CNodeDataType | CNodeModelDataType,
  self: CNode | CRootNode,
  materials: CMaterials = new CMaterials([])
) => {
  if (typeof data === 'string') {
    return data;
  }
  const res: CNodeModelDataType = {
    ...data,
    id: data.id ?? getRandomStr(),
    children: [],
    props: {},
    methods: data.methods || [],
    configure: merge(data.configure || {}, {
      propsSetter: {},
      advanceSetter: {},
    }),
  };

  const propsKeys = Object.keys(data.props || {});
  if (propsKeys.length) {
    propsKeys.forEach((propKey) => {
      const targetProps = data.props?.[propKey];

      if (targetProps instanceof CProp) {
        res.props[propKey] = targetProps;
        return;
      }
      res.props[propKey] = new CProp(propKey, targetProps || '', {
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
          materials: materials,
        }),
      ];
    }
  }
  return res;
};

type OnNodeChangeType = (params: DataModelEventType['onNodeChange']) => void;
type ParentType = CNode | CRootNode | CSlot | null;

export class CNode {
  nodeType = 'NODE';
  private rawData: CNodeDataType;
  private data: CNodeModelDataType;
  emitter = DataModelEmitter;
  parent: ParentType;
  materialsModel: CMaterials;
  listenerHandle: (() => void)[];
  onChangeCbQueue: OnNodeChangeType[];

  constructor(data: CNodeDataType, options?: { parent?: ParentType; materials: CMaterials | null }) {
    this.rawData = JSON.parse(JSON.stringify(data));
    checkNode(data);
    const materials = options?.materials || new CMaterials([]);
    this.parent = options?.parent || null;
    this.materialsModel = materials;
    this.data = parseNode(data, this, materials);
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
      ...this.export('design'),
      id: id || getRandomStr(),
    };
    return new CNode(newData, {
      materials: this.materialsModel,
    });
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

  contains(nodeId: string) {
    const res = getNode(this, nodeId);
    return res;
  }

  get props() {
    return this.data.props;
  }

  get material() {
    const materialModel = this.materialsModel;
    return materialModel?.findByComponentName(this.data.componentName);
  }

  getPlainProps() {
    const data = this.data;
    const props: any = {};
    Object.keys(data.props || {}).forEach((key) => {
      props[key] = data.props[key].export('design');
    });
    return props;
  }

  getNodeConfig(key: 'isContainer') {
    if (this.data.configure[key] !== undefined) {
      return this.data.configure.isContainer;
    } else {
      return this.material?.value.isContainer;
    }
  }

  isContainer() {
    return this.getNodeConfig('isContainer');
  }

  export(mode: ExportType): CNodeDataType {
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
        return child.export(mode);
      } else {
        return child;
      }
    });

    // handle configure props setter config, clear invalidate setter config
    const configure = data.configure || {};
    const propsSetter = configure.propsSetter || {};
    const newPropsSetter: typeof configure.propsSetter = {};
    Object.keys(propsSetter).forEach((key) => {
      const val = get(propsSetter, key, false);
      if (val) {
        newPropsSetter[key] = val;
      }
    });
    configure.propsSetter = newPropsSetter;
    // handle configure props setter config, clear invalidate setter config end
    if (this.material) {
      this.materialsModel.usedMaterials.push(this.material);
    }
    let newRes: any = {
      ...data,
      configure,
      props: props,
      children,
    };
    if (mode === 'design') {
      delete newRes.id;
    }
    newRes = clearSchema(newRes);
    return newRes;
  }
}
