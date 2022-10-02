import { CSchema } from '..';
import { ExportType } from '../../../const/schema';
import { CMaterials } from '../../../Material';
import { CNodeDataStructDescribe, CNodeDataType } from '../../../types/node';
import { getRandomStr } from '../../../util';
import { checkComplexData } from '../../../util/dataCheck';
import {
  DataModelEmitter,
  DataModelEventType,
} from '../../../util/modelEmitter';
import { CProp } from './props';

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
  children: CNode[];
  props: Record<string, CProp>;
};

export const parseNode = (
  data: CNodeDataType,
  parent: CNode | CSchema | null
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
        parent: parent,
      });
    });
  }

  if (data.children) {
    if (Array.isArray(data.children)) {
      res.children = data.children.map((el) => {
        if (el instanceof CNode) {
          return el;
        }
        return new CNode(el, {
          parent: parent,
        });
      });
    } else {
      if ((data.children as any) instanceof CNode) {
        res.children = [data.children];
      }
      res.children = [
        new CNode(data.children, {
          parent: parent,
        }),
      ];
    }
  }
  return res;
};

type OnNodeChangeType = (params: DataModelEventType['onNodeChange']) => void;

export class CNode {
  modeType = 'NODE';
  private rawData: CNodeDataType;
  private data: CNodeModelDataType;
  emitter = DataModelEmitter;
  parent: CNode | CSchema | null;
  materialModel: CMaterials | null;
  listenerHandle: (() => void)[];
  onChangeCbQueue: OnNodeChangeType[];

  constructor(data: any, options?: { parent?: CNode | CSchema | null }) {
    this.rawData = JSON.parse(JSON.stringify(data));
    checkNode(data);
    this.parent = options?.parent || null;
    this.materialModel = options?.parent?.materialModel || null;
    this.data = parseNode(data, this.parent);
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

  updateValue(val: Partial<CNodeDataType>) {
    const newVal: CNodeDataType | string = {
      ...this.export(),
      ...val,
    };

    this.data = parseNode(newVal, this.parent);
    this.emitter.emit('onNodeChange', {
      value: newVal,
      preValue: this.export(),
      node: this,
    });
    this.emitter.emit('onSchemaChange');
    this.emitter.emit('onPageChange');
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

  export(mode?: ExportType) {
    return this.rawData;
  }
}
