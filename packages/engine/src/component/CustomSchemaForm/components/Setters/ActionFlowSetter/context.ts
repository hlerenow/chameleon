import { createContext, useContext } from 'react';
import { CPage } from '@chamn/model';

interface ActionFlowContextType {
  pageModel: CPage;
}

export const ActionFlowContext = createContext<ActionFlowContextType>({
  pageModel: null as any,
});

export const useActionFlow = () => {
  const context = useContext(ActionFlowContext);
  if (!context) {
    throw new Error('useActionFlow must be used within ActionFlowProvider');
  }
  return context;
};
