/* eslint-disable react/no-unknown-property */
import React from 'react';
import { useContext, useEffect, useMemo, useRef } from 'react';

import { CNode } from '@chamn/model';
import { GridContext } from './context';
import styles from './style.module.scss';
import clsx from 'clsx';

export const GridItem = (props: {
  children: any;
  w: number;
  h: number;
  x: number;
  y: number;
  node?: CNode;
  dev?: boolean;
}) => {
  const ctx = useContext(GridContext);
  const refDom = useRef<HTMLDivElement>(null);
  const id = useMemo(() => {
    return props?.node?.id || Math.random().toString(32).slice(3, 9);
  }, []);

  useEffect(() => {
    if (ctx.ready) {
      ctx.gridStack?.makeWidget(refDom.current!);
    }
  }, [ctx.ready]);

  if (!ctx.ready) {
    return <></>;
  }

  return (
    <div
      className="grid-stack-item"
      ref={refDom}
      data-grid-id={id}
      gs-w={props.w}
      gs-h={props.h}
      gs-x={props.x}
      gs-y={props.y}
      style={{
        overflow: 'hidden',
        padding: '2px',
      }}
    >
      {props.dev && (
        <div
          className={clsx(['grid-drag-handler', styles.dragIcon])}
          style={{
            position: 'absolute',
            top: 8,
            right: 6,
            width: '16px',
            height: '18px',
            zIndex: 999,
            padding: '2px',
            backgroundColor: 'rgba(0,0,0,0.1)',
          }}
        >
          <svg
            style={{
              transform: 'rotate(45deg)',
            }}
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

      {props.children}
    </div>
  );
};
