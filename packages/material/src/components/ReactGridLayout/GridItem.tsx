/* eslint-disable react/no-unknown-property */
import React, { CSSProperties, forwardRef, useImperativeHandle } from 'react';
import { useContext, useEffect, useMemo, useRef } from 'react';

import { CNode } from '@chamn/model';
import { GridContext } from './context';
import styles from './style.module.scss';
import clsx from 'clsx';
import { DEFAULT_RESPONSIVE_SIZE } from './config';

type PosAndSizeInfoType = {
  w: number;
  h: number;
  x: number;
  y: number;
};

type ResponsiveItemInfo = {
  label: string;
  info: PosAndSizeInfoType;
};

export type GridItemPropsType = {
  children: any;
  responsive: ResponsiveItemInfo[];
  node?: CNode;
  dev?: boolean;
  style?: CSSProperties;
  $SET_DOM?: (dom: HTMLElement) => void;
  onGetRef?: (
    ref: React.MutableRefObject<GridItemRefType | undefined>
  ) => object;
};

export type GridItemRefType = {
  getCurrentPosAndSizeInfo: () => ResponsiveItemInfo;
};

export const GridItem = forwardRef<GridItemRefType, GridItemPropsType>(
  ({ dev, onGetRef, $SET_DOM, ...props }, ref) => {
    const ctx = useContext(GridContext);
    const refDom = useRef<HTMLDivElement>(null);
    const id = useMemo(() => {
      return props?.node?.id || Math.random().toString(32).slice(3, 9);
    }, []);

    /** 配合设计器使用 */
    if (refDom.current) {
      $SET_DOM?.(refDom.current);
    }

    useEffect(() => {
      if (ctx.ready) {
        ctx.gridStack?.makeWidget(refDom.current!);
      }
    }, [ctx.ready]);

    const currentSizeAndPosInfo = useMemo<ResponsiveItemInfo>(() => {
      const currentResponsiveLabel = ctx.currentBreakpoint.label;
      const targetItem = props.responsive.find(
        (el) => el.label === currentResponsiveLabel
      );
      const targetItemDefault = props.responsive.find(
        (el) => el.label === DEFAULT_RESPONSIVE_SIZE
      );
      if (!ctx.ready) {
        return {
          info: {},
        } as any;
      }
      return {
        ...(targetItem || targetItemDefault || ({ info: {} } as any)),
        label: ctx.currentBreakpoint.label,
      };
    }, [props.responsive, ctx.currentBreakpoint.label]);

    const currentSizeAndPosInfoRef = useRef<any>(currentSizeAndPosInfo);
    currentSizeAndPosInfoRef.current = currentSizeAndPosInfo;

    useEffect(() => {
      if (!ctx.ready) {
        return;
      }
      ctx.gridStack?.update(id, {
        ...currentSizeAndPosInfo?.info,
      });
    }, [currentSizeAndPosInfo, ctx]);
    const specialRef = useRef<GridItemRefType>();

    specialRef.current = {
      getCurrentPosAndSizeInfo: () => {
        return {
          ...(currentSizeAndPosInfoRef.current || {}),
        };
      },
    };
    // 配合  ReactGridItemMeta 文件使用
    onGetRef?.(specialRef);

    useImperativeHandle(
      ref,
      () => {
        return {
          getCurrentPosAndSizeInfo: () => {
            return {
              ...currentSizeAndPosInfo,
            };
          },
        };
      },
      [currentSizeAndPosInfo]
    );

    if (!ctx.ready) {
      return <></>;
    }
    return (
      <div
        className="grid-stack-item"
        id={id}
        ref={refDom}
        data-grid-id={id}
        gs-w={currentSizeAndPosInfo.info.w}
        gs-h={currentSizeAndPosInfo.info.h}
        gs-x={currentSizeAndPosInfo.info.x}
        gs-y={currentSizeAndPosInfo.info.y}
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '2px',
          boxSizing: 'border-box',
        }}
      >
        {dev && (
          <div className={clsx(['grid-drag-handler', styles.dragIcon])}>
            <svg
              style={{
                transform: 'rotate(45deg)',
              }}
              width={16}
              height={16}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
              />
            </svg>
          </div>
        )}
        <div
          {...props}
          style={{
            ...props.style,
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
          }}
        >
          {props.children}
        </div>
      </div>
    );
  }
);
