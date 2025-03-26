import { createContext, useContext } from 'react';

export interface CFragmentContextType {
  slotMap: Record<string, any>;
}

const CFragmentContext = createContext<CFragmentContextType>({
  slotMap: {},
});

export const useCFragmentContext = () => {
  const context = useContext(CFragmentContext);
  if (!context) {
    throw new Error('useCFragmentContext 必须在 LayoutProvider 内使用');
  }
  return context;
};

export const LayoutProvider = CFragmentContext.Provider;
