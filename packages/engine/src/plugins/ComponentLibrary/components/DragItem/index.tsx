import { Popover, Tooltip } from 'antd';
import clsx from 'clsx';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import styles from './style.module.scss';

export type DragComponentItemProps = {
  id: string;
  name: string;
  description?: any;
  icon: React.ReactNode | string;
  iconText?: string;
  style?: React.CSSProperties;
  containerClassName?: string;
};

export const DragComponentItem = (props: DragComponentItemProps) => {
  const dragInfo = {
    [DRAG_ITEM_KEY]: props.id,
  };
  const nameRef = useRef<HTMLSpanElement>(null);
  const [nameOverflow, setNameOverflow] = useState(false);

  const icon = useMemo(() => {
    if (props.iconText) {
      return <div className={styles.iconText}>{String(props.iconText).toUpperCase()}</div>;
    }
    if (typeof props.icon === 'string') {
      return <img className={styles.iconImg} src={props.icon} draggable={false} />;
    } else {
      return props.icon;
    }
  }, [props.icon, props.iconText]);

  useLayoutEffect(() => {
    const nameElement = nameRef.current;
    if (!nameElement) {
      return;
    }

    const updateNameOverflow = () => {
      setNameOverflow(nameElement.scrollWidth > nameElement.clientWidth);
    };

    updateNameOverflow();
    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateNameOverflow);
    resizeObserver?.observe(nameElement);
    return () => resizeObserver?.disconnect();
  }, [props.name]);

  const nameView = (
    <span ref={nameRef} className={styles.componentName}>
      {props.name}
    </span>
  );

  const contentView = (
    <div className={clsx([styles.square, props.containerClassName])}>
      <div {...dragInfo} className={styles.componentItem} style={props.style}>
        <div className={styles.iconBox}>{icon}</div>
        {nameOverflow ? (
          <Tooltip title={props.name} placement="top">
            {nameView}
          </Tooltip>
        ) : (
          nameView
        )}
      </div>
    </div>
  );

  if (props.description) {
    return (
      <Popover
        overlayInnerStyle={{
          maxWidth: '300px',
          maxHeight: '200px',
          overflow: 'auto',
        }}
        content={props.description || ''}
        zIndex={1000}
        placement="right"
      >
        {contentView}
      </Popover>
    );
  } else {
    return contentView;
  }
};

export const DRAG_ITEM_KEY = 'data-drag-key';
