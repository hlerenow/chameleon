import React, { useState } from 'react';
import { CopyOutlined, DeleteOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import styles from './style.module.scss';
import { CNode } from '@chameleon/model';
import clsx from 'clsx';

export type DefaultSelectToolBarProps = {
  nodeList: CNode[];
  toSelectNode: (id: string) => void;
  toDelete: (id: string) => void;
  toCopy: (idd: string) => void;
  toHidden: (idd: string) => void;
};

const LayoutSelect = ({
  dataSource,
  children,
  onSelect,
}: {
  dataSource: { key: string; label: string }[];
  children: React.ReactNode;
  onSelect: (key: string) => void;
}) => {
  const [hover, setHover] = useState(false);
  return (
    <div className={styles.layoutSelectBox}>
      <div className={clsx([styles.hoverBox, hover && styles.hoverBoxActive])}>
        {dataSource.map((el) => {
          return (
            <div className={styles.hoverItem} key={el.key} onClick={() => onSelect(el.key)}>
              {el.label}
            </div>
          );
        })}
      </div>
      <div className={styles.placeholder} onMouseOver={() => setHover(true)} onMouseOut={() => setHover(false)}>
        {children}
      </div>
    </div>
  );
};

export const DefaultSelectToolBar = ({
  nodeList,
  toSelectNode,
  toDelete,
  toCopy,
  toHidden,
}: DefaultSelectToolBarProps) => {
  const tempList = [...nodeList];
  const currentNode = tempList.shift();
  const parentNodeItems = tempList.map((el) => {
    const node = el;
    const nodeMeta = node.materialsModel.findByComponentName(node.value.componentName)?.value.title;
    const label = node.value.title || nodeMeta || node.value.componentName || '';
    return {
      key: el.id,
      label: label || 'Empty',
    };
  });

  const copyItem = (
    <div className={styles.item} onClick={() => toCopy(currentNode?.id || '')}>
      <CopyOutlined />
    </div>
  );

  const deleteItem = (
    <div className={styles.item} onClick={() => toDelete(currentNode?.id || '')}>
      <DeleteOutlined />
    </div>
  );

  const visibleItem = (
    <div className={styles.item} onClick={() => toHidden(currentNode?.id || '')}>
      <EyeInvisibleOutlined />
    </div>
  );

  const nodeLayout = (
    <LayoutSelect dataSource={parentNodeItems.reverse()} onSelect={toSelectNode}>
      <div>{currentNode?.value.title || currentNode?.material?.value.title || 'Empty'}</div>
    </LayoutSelect>
  );

  return (
    <div className={styles.toolBarBox}>
      {nodeLayout}
      {visibleItem}
      {copyItem}
      {deleteItem}
    </div>
  );
};
