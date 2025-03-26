import { useContext, useEffect, useRef, useState } from 'react';
import { CopyOutlined, DeleteOutlined, EyeInvisibleOutlined, EyeOutlined, RightOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import { CTreeContext, DragState } from './context';
import { TreeNodeData } from './dataStruct';
import styles from './style.module.scss';
import { CNode } from '@chamn/model';
import { Input, InputRef } from 'antd';
import { CPluginCtx } from '@/core/pluginManager';
import { DesignerPluginInstance } from '@/plugins/Designer/type';

export const DRAG_ITEM_KEY = 'data-drag-key';

export type TreeNodeProps = {
  item: TreeNodeData;
  level?: number;
  paths?: (string | number)[];
  pluginCtx: CPluginCtx;
};
export const TreeNode = (props: TreeNodeProps) => {
  const allStateRef = useRef<{ titleEditable: boolean }>({
    titleEditable: false,
  });
  const { level = 0, item, paths = ['0'] } = props;
  const [nodeVisible, setNodeVisible] = useState(true);
  const {
    state: ctxState,
    updateState,
    onSelectNode,
    onDeleteNode,
    getDesignerHandler,
    onCopyNode,
  } = useContext(CTreeContext);

  const [titleEditable, setTitleEditable] = useState(allStateRef.current?.titleEditable);
  const [editInputValue, setEditInputValue] = useState('');
  allStateRef.current.titleEditable = titleEditable;
  const expanded = ctxState.expandKeys.find((el) => el === item.key);
  const toggleExpandNode = (open?: boolean) => {
    let newExpandKeys = ctxState.expandKeys;
    if (open !== undefined) {
      if (open === true) {
        if (!expanded) {
          newExpandKeys.push(item.key || '');
        }
      } else {
        if (expanded) {
          newExpandKeys = newExpandKeys.filter((el) => el !== item.key);
        }
      }
    } else {
      if (expanded) {
        newExpandKeys = newExpandKeys.filter((el) => el !== item.key);
      } else {
        newExpandKeys.push(item.key || '');
      }
    }

    updateState({
      expandKeys: newExpandKeys,
    });
  };
  const selected = ctxState.currentSelectNodeKeys.find((el) => el === item.key);
  const titleEditInputRef = useRef<InputRef>(null);
  const toggleSelectNode = async () => {
    toggleExpandNode(true);
    if (titleEditable) {
      titleEditInputRef?.current?.focus();
      return;
    }
    if (item.canBeSelected !== undefined && item.canBeSelected === false) {
      return;
    }
    let newKeys = ctxState.currentSelectNodeKeys;
    if (!ctxState.multiSelect) {
      if (item.key) {
        const flag = await onSelectNode?.({ keys: [item.key], node: item });
        if (flag) {
          updateState({
            currentSelectNodeKeys: [String(item.key)],
          });
        }
      } else {
        onSelectNode?.({ keys: [], node: item });
      }

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

    const clickHandle = (e: MouseEvent) => {
      if (allStateRef.current.titleEditable) {
        if (e.target === titleEditInputRef.current?.input) {
          return;
        }
        setTitleEditable(false);
        targetNodeModel.updateValue();
      }
    };
    let sunWin: Window | null;
    const registerDesignerClick = async () => {
      const designerPluginInstance = await props.pluginCtx.pluginManager.get<DesignerPluginInstance>('Designer');
      const designerHandler = designerPluginInstance?.export;
      const win = designerHandler?.getDesignerWindow();
      win?.addEventListener('click', clickHandle);
      sunWin = win || null;
    };

    registerDesignerClick();
    document.addEventListener('click', clickHandle);

    return () => {
      if (timerHandler) {
        clearTimeout(timerHandler);
      }
      document.removeEventListener('click', clickHandle);
      sunWin?.removeEventListener('click', clickHandle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const targetNodeModel = ctxState.pageModel?.getNode(item.key || '') as CNode;

  const toggleNodeVisible = () => {
    const newVisible = !nodeVisible;

    if (!targetNodeModel) {
      return;
    }
    const devState = targetNodeModel.value.configure.devState ?? {};
    devState.condition = newVisible;
    targetNodeModel.value.configure.devState = devState;
    targetNodeModel.updateValue();
    setNodeVisible(newVisible);
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
        className={clsx([styles.nodeContent, selected && canBeSelected && styles.selected])}
        style={{ marginLeft: `${-indent}px`, paddingLeft: `${indent + 8}px` }}
        onMouseMove={async () => {
          if (!item.key) {
            return;
          }
          const designerHandler = await getDesignerHandler?.();
          const compInstances = designerHandler?.getDynamicComponentInstances(item.key);
          if (typeof compInstances?._CONDITION !== 'undefined') {
            setNodeVisible(compInstances?._CONDITION);
          }
        }}
      >
        {item.children?.length ? (
          <span style={{ paddingRight: '5px' }} className={styles.arrowSpan} onClickCapture={() => toggleExpandNode()}>
            <RightOutlined className={clsx([styles.nodeArrow, expanded && styles.expanded])} />
          </span>
        ) : null}
        <div
          className={styles.nodeRenderView}
          {...dragKeyProps}
          ref={domRef}
          onClick={toggleSelectNode}
          onDoubleClick={() => {
            // slot 节点，属性节点不能编辑 title
            if (!targetNodeModel) {
              return;
            }
            const node = targetNodeModel;
            const nodeMeta = node.materialsModel.findByComponentName(node.value.componentName)?.value.title;
            const inputValue = node.value.title || nodeMeta || node.value.componentName || '';
            setEditInputValue(inputValue);
            setTitleEditable(true);
            setTimeout(() => {
              titleEditInputRef.current?.focus();
            }, 16.66);
          }}
        >
          {!titleEditable && titleView}
          {titleEditable && (
            <div
              style={{
                paddingRight: '10px',
              }}
            >
              <Input
                size="small"
                maxLength={20}
                style={{}}
                ref={titleEditInputRef}
                value={editInputValue}
                onPressEnter={() => {
                  setTitleEditable(false);
                  targetNodeModel.updateValue();
                }}
                onChange={(e) => {
                  targetNodeModel.value.title = e.target.value;
                  setEditInputValue(e.target.value);
                }}
              />
            </div>
          )}
        </div>

        {!titleEditable && !item.rootNode && (
          <div className={styles.toolbarBox}>
            <div className={styles.iconItem}>
              {!nodeVisible && <EyeOutlined onClick={toggleNodeVisible} />}
              {nodeVisible && <EyeInvisibleOutlined onClick={toggleNodeVisible} />}
            </div>
            <div
              className={styles.iconItem}
              onClick={() => {
                onCopyNode(item.key || '');
              }}
            >
              <CopyOutlined />
            </div>
            <div
              className={styles.iconItem}
              onClick={() => {
                onDeleteNode(item.key || '');
              }}
            >
              <DeleteOutlined />
            </div>
          </div>
        )}
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
              <TreeNode key={key} item={el} paths={[...paths, index]} level={level + 1} pluginCtx={props.pluginCtx} />
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
