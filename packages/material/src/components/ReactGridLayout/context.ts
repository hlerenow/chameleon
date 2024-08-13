import { GridStack } from 'gridstack';
import { createContext } from 'react';
import { GridItemInstance } from './type';

export function getDefaultContextValue() {
  return {
    ready: false,
    gridStack: null,
    gridItemsMap: {},
  } as any;
}

export type GridContextType = {
  ready: boolean;
  gridStack: GridStack | null;
  gridItemsMap: Record<string, GridItemInstance>;
  addGridItem: (item: GridItemInstance) => void;
  onMount: ((gridStack: GridStack) => void)[];
};

export const GridContext = createContext<GridContextType>(
  getDefaultContextValue()
);
