import React from 'react';
import styles from './style.module.scss';

export const DragItem = () => {
  const dragInfo = {
    [DRAG_ITEM_KEY]: 111,
  };
  return (
    <div {...dragInfo} className={styles.componentItem}>
      <span>123</span>
    </div>
  );
};

export const DRAG_ITEM_KEY = 'data-drag-key';
