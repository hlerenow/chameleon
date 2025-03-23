import { CNode, CRootNode } from '@chamn/model';
import { AdapterOptionType } from '../adapter';
import { StoreManager } from '../storeManager';
import { VariableManager } from '../variableManager';
import { StoreApi } from 'zustand';

export type TRenderBaseOption = {
  storeManager: StoreManager;
  variableManager: VariableManager;
  runtimeComponentCache: Map<string, { component: any }>;
  getComponent: (currentNode: CNode | CRootNode) => any;
  /** render 支持的所有的组件映射 */
  components: Record<string, any>;
  doc: Document;
} & Pick<
  Required<AdapterOptionType>,
  'onGetRef' | 'processNodeConfigHook' | 'refManager' | 'onComponentDestroy' | 'onComponentMount' | 'renderMode'
> &
  Pick<AdapterOptionType, 'requestAPI'>;

export interface IDynamicComponent {
  _CONDITION: boolean;
  _DESIGN_BOX: boolean;
  _NODE_MODEL: CNode | CRootNode;
  _NODE_ID: string;
  UNIQUE_ID: string;
  targetComponentRef: React.MutableRefObject<any>;
  listenerHandle: (() => void)[];
  storeState: StoreApi<any>;
  storeListenDisposeList: (() => void)[];
  domHeader?: HTMLHeadElement;
  mediaStyleDomMap: Record<string, HTMLStyleElement>;
  variableSpace: {
    staticVar: Record<any, any>;
    methods: Record<any, (...args: any) => any>;
  };
  nodeName: string;
  // 方法定义
  updateState(newState: any): void;
  connectStore(): void;
  addMediaCSS(): void;
  removeMediaCSS(): void;
  getStyleDomById(id: string): HTMLStyleElement;
  rebuildNode(): void;
  componentDidMount(): void;
  componentWillUnmount(): void;
  render(): React.ReactNode;
}
