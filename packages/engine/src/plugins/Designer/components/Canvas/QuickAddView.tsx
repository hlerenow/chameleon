import React, { useEffect, useMemo, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Popover } from 'antd';
import { CNode, CRootNode, InsertNodePosType, SnippetsType } from '@chamn/model';
import { RenderInstance } from '@chamn/render';
import styles from './style.module.scss';

export type QuickAddViewProps = {
  instance: RenderInstance;
  direction: 'vertical' | 'horizontal';
  getMaterials: (node: CNode | CRootNode) => SnippetsType[];
  onAdd: (node: CNode | CRootNode, snippet: SnippetsType, pos: InsertNodePosType) => void;
};

export const QuickAddView = ({ instance, direction, getMaterials, onAdd }: QuickAddViewProps) => {
  const node = instance._NODE_MODEL;
  const [openPosition, setOpenPosition] = useState<'before' | 'after' | null>(null);
  const materials = useMemo(() => getMaterials(node), [getMaterials, node]);

  useEffect(() => {
    setOpenPosition(null);
  }, [instance, node]);

  useEffect(() => {
    if (openPosition === null) {
      return;
    }

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      if (target.closest(`.${styles.quickAddList}`)) {
        return;
      }

      setOpenPosition(null);
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => document.removeEventListener('pointerdown', handleOutsidePointerDown);
  }, [openPosition]);

  return (
    <div className={`${styles.quickAddBox} ${styles[direction]}`}>
      {(['before', 'after'] as const).map((position) => (
        <Popover
          key={position}
          open={openPosition === position}
          onOpenChange={(nextOpen) => setOpenPosition(nextOpen ? position : null)}
          trigger="click"
          placement={
            direction === 'vertical'
              ? position === 'before'
                ? 'top'
                : 'bottom'
              : position === 'before'
              ? 'left'
              : 'right'
          }
          overlayInnerStyle={{ padding: 0 }}
          content={
            <div className={styles.quickAddList}>
              {materials.map((snippet) => (
                <button
                  key={snippet.id || snippet.title}
                  className={styles.quickAddItem}
                  type="button"
                  onClick={() => {
                    onAdd(node, snippet, position === 'before' ? 'BEFORE' : 'AFTER');
                    setOpenPosition(null);
                  }}
                >
                  <span className={styles.quickAddName}>
                    {(snippet.schema.componentName || snippet.title).toUpperCase()}
                  </span>
                  <span className={styles.quickAddTitle}>{snippet.title}</span>
                </button>
              ))}
            </div>
          }
        >
          <button
            type="button"
            className={`${styles.quickAddButton} ${styles[position]}`}
            aria-label={`Add ${position}`}
            onClick={() => setOpenPosition(position)}
          >
            <PlusOutlined />
          </button>
        </Popover>
      ))}
    </div>
  );
};
