import React, { useRef } from 'react';
import { ColumnOptions, GridStack } from 'gridstack';
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
import { debounce } from 'lodash-es';
import { ResponsivePoint } from './type';

export type ReactGridLayoutPropsType = {
  children: any;
  onMount?: (grid: GridStack) => void;
  ctx: EnginContext;
  subWin?: Window;
  staticGrid?: boolean;
  animate?: boolean;
  layout?: ColumnOptions;
  breakpoints?: ResponsivePoint[];
  onBreakpointChange?: (breakpoint: { w: number; label: string }) => void;
};

export const GridLayout = ({
  subWin,
  staticGrid,
  animate,
  onMount,
  ...props
}: ReactGridLayoutPropsType) => {
  const [ctx, setCtx] = useState<GridContextType>(getDefaultContextValue());
  const id = useMemo(() => {
    return Math.random().toString(32).slice(3, 9);
  }, []);
  const gridRef = useRef<GridStack>();

  const init = async () => {
    const tempGridStack: typeof GridStack =
      (subWin as any)?.GridStack || GridStack;

    const grid = tempGridStack.init(
      {
        cellHeight: '30px',
        margin: 3,
        column: 24,
        float: true,
        minRow: 3,
        animate: true,
        staticGrid: staticGrid ?? true,
        columnOpts: {
          layout: 'scale',
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
    gridRef.current = grid;
    onMount?.(grid);
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
  };

  useEffect(() => {
    if (props.breakpoints) {
      gridRef.current?.destroy(false);
      init();
    }
  }, [props.breakpoints, props.layout]);

  const responseJudge = debounce(() => {
    const sunWinW = (subWin ?? window).innerWidth;
    const pointInfo = breakpoints.find((el) => el.w >= sunWinW);
    if (!pointInfo) {
      return;
    }

    setCtx((oldVal) => {
      props.onBreakpointChange?.(pointInfo);
      if (pointInfo.w === ctx.currentBreakpoint.w) {
        return oldVal;
      }
      return {
        ...oldVal,
        currentBreakpoint: pointInfo,
      };
    });
  }, 50);

  useEffect(() => {
    window.addEventListener('resize', responseJudge);
    subWin?.addEventListener('resize', responseJudge);
    responseJudge();
    return () => {
      window.removeEventListener('resize', responseJudge);
      subWin?.removeEventListener('resize', responseJudge);
    };
  }, []);

  const finalCtx = useMemo(() => {
    return {
      ...ctx,
      breakpoints: props.breakpoints ?? breakpoints,
    };
  }, [ctx, props.breakpoints]);

  return (
    <GridContext.Provider value={finalCtx}>
      <div id={id} className="grid-stack" {...props}>
        {props.children}
      </div>
    </GridContext.Provider>
  );
};
