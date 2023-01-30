import { RightOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import React, { useContext } from 'react';
import { CTreeContext } from './context';
import { TreeNodeData } from './dataStruct';
import styles from './style.module.scss';

export const DRAG_ITEM_KEY = 'data-drag-key';

export type TreeNodeProps = {
  item: TreeNodeData;
  level?: number;
  paths?: (string | number)[];
};
export const TreeNode = (props: TreeNodeProps) => {
  const { level = 0, item, paths = ['0'] } = props;
  const {
    state: ctxState,
    updateState,
    onSelectNode,
  } = useContext(CTreeContext);
  const expanded = ctxState.expandKeys.find((el) => el === item.key);

  const toggleExpandNode = () => {
    let newExpandKeys = ctxState.expandKeys;
    if (expanded) {
      newExpandKeys = newExpandKeys.filter((el) => el !== item.key);
    } else {
      newExpandKeys.push(item.key || '');
    }
    updateState({
      expandKeys: newExpandKeys,
    });
  };
  const selected = ctxState.currentSelectNodeKeys.find((el) => el === item.key);

  const toggleSelectNode = () => {
    let newKeys = ctxState.currentSelectNodeKeys;
    if (!ctxState.multiSelect) {
      if (item.key) {
        onSelectNode?.({ keys: [item.key] });
      } else {
        onSelectNode?.({ keys: [] });
      }

      updateState({
        currentSelectNodeKeys: [String(item.key)],
      });
      return;
    }
    if (selected) {
      newKeys = newKeys.filter((el) => el !== item.key);
    } else {
      newKeys.push(String(item.key));
    }
    onSelectNode?.({ keys: newKeys });
    updateState({
      currentSelectNodeKeys: newKeys,
    });
  };
  const singPadding = 20;
  const indent = singPadding * level;
  return (
    <div className={styles.nodeBox}>
      <div
        className={clsx([styles.nodeContent, selected && styles.selected])}
        style={{ marginLeft: `${-indent}px`, paddingLeft: `${indent + 8}px` }}
      >
        {item.children?.length ? (
          <span style={{ paddingRight: '5px' }}>
            <RightOutlined
              onClickCapture={toggleExpandNode}
              className={clsx([styles.nodeArrow, expanded && styles.expanded])}
            />
          </span>
        ) : null}
        <div
          className={styles.nodeRenderView}
          data-drag-key={item.key}
          onClick={toggleSelectNode}
        >
          {item.title}
        </div>
      </div>
      <div
        className={clsx([styles.nodeChildren, selected && styles.selected])}
        style={{
          paddingLeft: `${singPadding}px`,
          height: expanded ? 'auto' : '0',
        }}
      >
        {expanded &&
          item.children?.map((el, index) => {
            const key = `${el.key}-${index}`;
            return (
              <TreeNode
                key={key}
                item={el}
                paths={[...paths, index]}
                level={level + 1}
              />
            );
          })}
      </div>
    </div>
  );
};
