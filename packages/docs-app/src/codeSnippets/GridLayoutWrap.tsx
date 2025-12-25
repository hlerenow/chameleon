import { useRef } from 'react';
import { GridLayout, ReactGridLayoutPropsType } from '..';
import { GridStack, GridStackElementHandler } from 'gridstack';
import { breakpoints } from '../config';
import { GridItemPropsType } from '../GridItem';

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
    targetComp: typeof GridLayout;
  }
) => {
  const { targetComp: Comp, ...restProps } = props;
  const ref = useRef<GridStack>();

  const initEditLogic = (grid: GridStack) => {
    const updateGridItemLayout: GridStackElementHandler = (changeLayout) => {
      const { detail }: ChangeLayoutEvent = changeLayout as any;
      const sunWinW = props.subWin!.innerWidth;
      const pointInfo = breakpoints.find((el) => el.w >= sunWinW);
      detail.forEach((item) => {
        const nodeId = item.el.getAttribute('data-grid-id');
        const node = props.ctx.engine.pageModel.getNode(String(nodeId));
        if (node) {
          const plainProps: GridItemPropsType = node.getPlainProps();
          const newResponsive = plainProps.responsive;
          let targetItem = newResponsive.find((el) => el.label === pointInfo!.label);
          if (!targetItem) {
            targetItem = {
              label: pointInfo!.label,
              info: {} as any,
            };
            newResponsive.push(targetItem);
          }
          targetItem.info = {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
          };

          node.updateValue({
            props: plainProps,
          });
        }
      });
    };
    grid.on('change', updateGridItemLayout);
  };

  return (
    <Comp
      {...restProps}
      animate={true}
      staticGrid={false}
      subWin={props.subWin}
      onMount={(grid) => {
        ref.current = grid;
        initEditLogic(grid);
        restProps.onMount?.(grid);
      }}
    />
  );
};
