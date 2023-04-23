import { merge, omit } from 'lodash-es';
import { CPage } from '..';
import { ExportType, ExportTypeEnum } from '../../const/schema';
import { CMaterials } from '../../Material';
import { CRootNodeDataType, CRootNodeDataTypeDescribe, InnerComponentNameEnum } from '../../types/rootNode';
import { clearSchema, getNode, getRandomStr } from '../../util';
import { checkComplexData } from '../../util/dataCheck';
import { isArray, isPlainObject } from '../../util/lodash';
import { DataModelEmitter, DataModelEventType } from '../../util/modelEmitter';
import { CNode } from './Node/index';
import { CProp } from './Node/prop';

export type CRootNodeModelDataType = Omit<CRootNodeDataType, 'children'> & {
  id: string;
  children: CNode[];
  props: Record<string, CProp>;
  configure: Required<CRootNodeDataType>['configure'];
};

export const checkRootNode = (data: any): CRootNodeDataType => {
  checkComplexData({
    data: data,
    dataStruct: CRootNodeDataTypeDescribe,
    throwError: false,
  });
  return data;
};

export const parseSchema = (
  data: CRootNodeDataType | CRootNodeModelDataType,
  parent: CRootNode,
  materials: CMaterials
): CRootNodeModelDataType => {
  const res: CRootNodeModelDataType = {
    ...data,
    id: getRandomStr(),
    props: {} as any,
    componentName: InnerComponentNameEnum.ROOT_CONTAINER,
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

export class CRootNode {
  private rawData: CRootNodeDataType;
  private data: CRootNodeModelDataType;
  nodeType = InnerComponentNameEnum.ROOT_CONTAINER;
  emitter = DataModelEmitter;
  materialsModel: CMaterials;
  listenerHandle: (() => void)[];
  onChangeCbQueue: OnNodeChangeType[];
  parent: CPage | null;
  constructor(data: any, { parent, materials }: { parent: CPage | null; materials: CMaterials }) {
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

  updateValue(val?: Partial<CRootNodeModelDataType>) {
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

  /**
   * 从物料 和 node config 中获取合并后的属性，node 中的配置优先级更高
   * @param key 目前只支持 isContainer 属性
   * @returns
   */
  getMaterialConfig(key: 'isContainer') {
    if (this.data.configure[key] !== undefined) {
      return this.data.configure.isContainer;
    } else {
      return this.material?.value.isContainer;
    }
  }

  isContainer() {
    return this.getMaterialConfig('isContainer');
  }

  export(mode: ExportType = ExportTypeEnum.SAVE): CRootNodeDataType {
    const data = this.data;
    const props: any = {};
    Object.keys(data.props || {}).forEach((key) => {
      props[key] = data.props[key].export(mode);
    });
    const children: any[] =
      data.children?.map((child) => {
        return child?.export?.(mode);
      }) || [];

    const tempData: CRootNodeDataType = {
      ...data,
      props: props,
      children: children.filter((el) => el),
    };
    let finalRes: any = omit(tempData, ['id']);
    finalRes = clearSchema(finalRes);

    return finalRes;
  }

  getPlainProps() {
    const data = this.data;
    const props: any = {};
    Object.keys(data.props || {}).forEach((key) => {
      props[key] = data.props[key].export('design');
    });
    return props;
  }

  destroy() {
    this.listenerHandle.forEach((it) => it());
  }

  clone(id?: string) {
    const newData = {
      ...this.export('design'),
      id: id || getRandomStr(),
    };
    return new CRootNode(newData, {
      materials: this.materialsModel,
      parent: null,
    });
  }
}
