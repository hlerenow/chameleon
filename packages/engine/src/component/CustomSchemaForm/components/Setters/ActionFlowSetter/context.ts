import { createContext, useContext } from 'react';
import { CPage } from '@chamn/model';
import { CPluginCtx } from '@/core/pluginManager';

interface ActionFlowContextType {
  pluginCtx: CPluginCtx;
  pageModel: CPage;
  /** 数据有改变时，包含节点内部的数据 */
  onDataChange: () => void;
}

export const ActionFlowContext = createContext<ActionFlowContextType>({
  pluginCtx: null as any,
  pageModel: null as any,
  onDataChange: () => {},
});

export const useActionFlow = () => {
  const context = useContext(ActionFlowContext);
  if (!context) {
    throw new Error('useActionFlow must be used within ActionFlowProvider');
  }
  return context;
};
