import { CNode, CRootNode } from '@chamn/model';
import { AdapterOptionType } from '../adapter';
import { StoreManager } from '../storeManager';
import { VariableManager } from '../variableManager';

export type TRenderBaseOption = {
  storeManager: StoreManager;
  variableManager: VariableManager;
  runtimeComponentCache: Map<string, { component: any }>;
  getComponent: (currentNode: CNode | CRootNode) => any;
} & Pick<
  Required<AdapterOptionType>,
  'onGetRef' | 'processNodeConfigHook' | 'refManager' | 'onComponentDestroy' | 'onComponentMount' | 'renderMode'
>;
