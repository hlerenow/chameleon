import { Popover } from 'antd';
import React, { useMemo } from 'react';
import styles from './style.module.scss';

export type DragComponentItemProps = {
  id: string;
  name: string;
  description?: any;
  icon: React.ReactNode | string;
  style?: React.CSSProperties;
};

export const DragComponentItem = (props: DragComponentItemProps) => {
  const dragInfo = {
    [DRAG_ITEM_KEY]: props.id,
  };

  const icon = useMemo(() => {
    if (typeof props.icon === 'string') {
      return <img className={styles.iconImg} src={props.icon} />;
    } else {
      return props.icon;
    }
  }, [props.icon]);

  const contentView = (
    <div className={styles.square}>
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
