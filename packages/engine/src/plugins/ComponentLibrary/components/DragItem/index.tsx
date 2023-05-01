import { Popover } from 'antd';
import clsx from 'clsx';
import React, { useMemo } from 'react';
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

  const icon = useMemo(() => {
    if (props.iconText) {
      return <div className={styles.iconText}>{String(props.iconText).toUpperCase()}</div>;
    }
    if (typeof props.icon === 'string') {
      return <img className={styles.iconImg} src={props.icon} draggable={false} />;
    } else {
      return props.icon;
    }
  }, [props.icon]);

  const contentView = (
    <div className={clsx([styles.square, props.containerClassName])}>
      <div {...dragInfo} className={styles.componentItem} style={props.style}>
        <div className={styles.iconBox}>{icon}</div>
        <span>{props.name}</span>
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
