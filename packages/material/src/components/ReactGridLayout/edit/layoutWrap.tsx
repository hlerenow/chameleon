import { useEffect, useRef } from 'react';
import { ReactGridLayout, ReactGridLayoutPropsType } from '..';
import { GridStack } from 'gridstack';
import { breakpoints } from '../config';
import { debounce } from 'lodash-es';
import React from 'react';

type ChangeLayoutEvent = {
  detail: {
    el: HTMLElement;
    grid: GridStack;
    x: number;
    y: number;
    w: number;
    h: number;
  }[];
};

export const LayoutWrap = (
  props: ReactGridLayoutPropsType & {
    targetComp: typeof ReactGridLayout;
  }
) => {
  const { targetComp: Comp, ...restProps } = props;
  const ref = useRef<GridStack>();

  const initEditLogic = (grid: GridStack) => {
    ref.current = grid;
    grid.on('change', (changeLayout) => {
      const res = grid.save(true, true);
      const { detail }: ChangeLayoutEvent = changeLayout as any;

      detail.forEach((item) => {
        const nodeId = item.el.getAttribute('data-grid-id');
        const node = props.ctx.engine.pageModel.getNode(String(nodeId));
        if (node) {
          node.updateValue({
            props: {
              x: item.x,
              y: item.y,
              w: item.w,
              h: item.h,
            },
          });
        }
      });
    });
    const responseJudge = debounce(() => {
      console.log('change sun reeize');
      const sunWinW = props.subWin!.innerWidth;
      const pointInfo = breakpoints.find((el) => el.w > sunWinW);
      if (pointInfo?.c && grid.getColumn() !== pointInfo.c) {
        grid.column(pointInfo?.c);
      }
    }, 200);
    props.subWin?.addEventListener('resize', responseJudge);
  };

  return (
    <Comp
      {...restProps}
      animate={true}
      staticGrid={false}
      onMount={(grid) => {
        ref.current = grid;
        initEditLogic(grid);
        restProps.onMount?.(grid);
      }}
    />
  );
};
