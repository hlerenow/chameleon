import { GridStack } from 'gridstack';
import { createContext } from 'react';
import { GridItemInstance, ResponsivePoint } from './type';
import { breakpoints } from './config';

export function getDefaultContextValue() {
  return {
    ready: false,
    gridStack: null,
    gridItemsMap: {},
    breakpoints,
    currentBreakpoint: {},
  } as any;
}

export type GridContextType = {
  ready: boolean;
  gridStack: GridStack | null;
  gridItemsMap: Record<string, GridItemInstance>;
  addGridItem: (item: GridItemInstance) => void;
  onMount: ((gridStack: GridStack) => void)[];
  breakpoints: ResponsivePoint[];
  currentBreakpoint: ResponsivePoint;
};

export const GridContext = createContext<GridContextType>(
  getDefaultContextValue()
);
