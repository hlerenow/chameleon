import React from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';
import 'gridstack/dist/gridstack-extra.min.css';
import './layout.scss';
import { useEffect, useMemo, useState } from 'react';
import { EnginContext } from '@chamn/engine';
import {
  getDefaultContextValue,
  GridContext,
  GridContextType,
} from './context';
import { breakpoints } from './config';

export type ReactGridLayoutPropsType = {
  children: any;
  onMount: (grid: GridStack) => void;
  ctx: EnginContext;
  subWin?: Window;
  staticGrid?: boolean;
  animate?: boolean;
};

export const ReactGridLayout = ({
  subWin,
  staticGrid,
  animate,
  ...props
}: ReactGridLayoutPropsType) => {
  const [ctx, setCtx] = useState<GridContextType>(getDefaultContextValue());
  const id = useMemo(() => {
    return Math.random().toString(32).slice(3, 9);
  }, []);
  useEffect(() => {
    const tempGridStack: typeof GridStack =
      (subWin as any)?.GridStack || GridStack;

    const grid = tempGridStack.init(
      {
        cellHeight: '30px',
        margin: 3,
        column: 24,
        float: true,
        minRow: 3,
        animate: animate || false,
        staticGrid: staticGrid ?? true,
        columnOpts: {
          layout: 'moveScale',
          breakpointForWindow: false,
          breakpoints: breakpoints,
        },
        draggable: {
          handle: '.grid-drag-handler',
        },
      },
      id
    );
    if (!grid) {
      return;
    }

    props.onMount?.(grid);
    setCtx((oldVal) => {
      return {
        ...oldVal,
        gridStack: grid,
        ready: true,
      };
    });

    ctx.onMount?.forEach((el) => {
      el(grid);
    });
  }, []);

  return (
    <GridContext.Provider value={ctx}>
      <div id={id} className="grid-stack" style={{}}>
        {props.children}
      </div>
    </GridContext.Provider>
  );
};
