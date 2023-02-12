import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  RightOutlined,
} from '@ant-design/icons';
import clsx from 'clsx';
import { CTreeContext, DragState } from './context';
import { TreeNodeData } from './dataStruct';
import styles from './style.module.scss';
import { LOGGER } from '../../../../utils/logger';
import { CNode } from '@chameleon/model';

export const DRAG_ITEM_KEY = 'data-drag-key';

export type TreeNodeProps = {
  item: TreeNodeData;
  level?: number;
  paths?: (string | number)[];
};
export const TreeNode = (props: TreeNodeProps) => {
  const { level = 0, item, paths = ['0'] } = props;
  const [nodeVisible, setNodeVisible] = useState(true);
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
    if (item.canBeSelected !== undefined && item.canBeSelected === false) {
      return;
    }
    let newKeys = ctxState.currentSelectNodeKeys;
    if (!ctxState.multiSelect) {
      if (item.key) {
        onSelectNode?.({ keys: [item.key], node: item });
      } else {
        onSelectNode?.({ keys: [], node: item });
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
    onSelectNode?.({ keys: newKeys, node: item });
    updateState({
      currentSelectNodeKeys: newKeys,
    });
  };
  const singPadding = 20;
  const indent = singPadding * level;
  const canBeSelected = item.canBeSelected ?? true;

  const dragKeyProps = {
    [DRAG_ITEM_KEY]: item.key,
  };
  const updateExpandKeyRef = useRef<(key: string) => void>();
  const ctxStateRef = useRef<typeof ctxState>();
  ctxStateRef.current = ctxState;
  updateExpandKeyRef.current = (key) => {
    const oldExpandKeys = ctxState.expandKeys;
    const newExpandKeys = Array.from(new Set([...oldExpandKeys, key]));
    updateState({
      expandKeys: newExpandKeys,
    });
  };
  const domRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // auto expand on dragging
    let timerHandler = 0;
    domRef.current?.addEventListener('mouseenter', () => {
      timerHandler = window.setTimeout(() => {
        if (ctxStateRef.current?.dragState === DragState.DRAGGING) {
          updateExpandKeyRef.current?.(item.key || '');
        }
      }, 0.8 * 1000);
    });
    domRef.current?.addEventListener('mouseleave', () => {
      clearTimeout(timerHandler);
    });

    return () => {
      if (timerHandler) {
        clearTimeout(timerHandler);
      }
    };
  }, []);

  const toggleNodeVisible = () => {
    const newVisible = !nodeVisible;
    console.log('!nodeVisible', newVisible);

    const targetNodeModel = ctxState.pageModel?.getNode(
      item.key || ''
    ) as CNode;
    if (!targetNodeModel) {
      return;
    }
    targetNodeModel.value.condition = newVisible;
    targetNodeModel.updateValue();
    setNodeVisible(!nodeVisible);
  };

  let titleView = item.title;
  if (item.titleViewRender) {
    titleView = item.titleViewRender({
      item,
      titleView: item.title,
    });
  }
  const bodyView = (
    <div className={styles.nodeBox}>
      <div
        className={clsx([
          styles.nodeContent,
          selected && canBeSelected && styles.selected,
        ])}
        style={{ marginLeft: `${-indent}px`, paddingLeft: `${indent + 8}px` }}
        onMouseMove={() => {
          if (!item.key) {
            return;
          }
          const compInstances =
            ctxState.designerHandler?.getDynamicComponentInstances(item.key);
          console.log('compInstances?._CONDITION', compInstances?._CONDITION);
          if (typeof compInstances?._CONDITION !== 'undefined') {
            setNodeVisible(compInstances?._CONDITION);
          }
        }}
      >
        {item.children?.length ? (
          <span
            style={{ paddingRight: '5px' }}
            className={styles.arrowSpan}
            onClickCapture={toggleExpandNode}
          >
            <RightOutlined
              className={clsx([styles.nodeArrow, expanded && styles.expanded])}
            />
          </span>
        ) : null}
        <div
          className={styles.nodeRenderView}
          {...dragKeyProps}
          ref={domRef}
          onClick={toggleSelectNode}
        >
          {titleView}
        </div>
        <div className={styles.toolbarBox}>
          {!item.rootNode && (
            <div>
              {!nodeVisible && <EyeOutlined onClick={toggleNodeVisible} />}
              {nodeVisible && (
                <EyeInvisibleOutlined onClick={toggleNodeVisible} />
              )}
            </div>
          )}
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
  if (item.containerRender) {
    const containerView = item.containerRender({
      item: item,
      treeNodeView: bodyView,
    });
    return containerView;
  }
  return bodyView;
};
