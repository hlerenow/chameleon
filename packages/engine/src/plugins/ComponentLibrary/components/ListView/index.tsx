import React, { useMemo } from 'react';
import { SnippetsType } from '@chamn/model';
import { Collapse } from 'antd';
import { DragComponent, DragComponentItem } from '../DragItem';
import styles from './style.module.scss';

export type ListViewDataSource = {
  name: string;
  list: SnippetsType[];
}[];

export type ComponentLibItemRenderProps = {
  /** The material snippet represented by this card. */
  item: SnippetsType;
  /** Default card, useful when custom rendering only adds a wrapper or actions. */
  defaultView: React.ReactNode;
  /** Add this wrapper around custom content to retain engine drag behavior. */
  DragComponent: typeof DragComponent;
};

export type ListViewProps = {
  dataSource: ListViewDataSource;
  renderItem?: (props: ComponentLibItemRenderProps) => React.ReactNode;
};
export const ListView = (props: ListViewProps) => {
  const { dataSource, renderItem } = props;
  const defaultActiveKey = dataSource.map((el) => el.name || '');

  const items = useMemo(() => {
    return dataSource.map((el) => {
      const category = el.name || '';
      const contentView = (
        <div className={styles.collapsePanel}>
          {el.list.map((it) => {
            const defaultView = (
              <DragComponentItem
                id={it.id!}
                key={it.id!}
                name={it.title}
                icon={it.snapshot || it.snapshotText}
                iconText={it.snapshotText}
                description={it.description || ''}
              />
            );
            const itemView = renderItem
              ? renderItem({
                  item: it,
                  defaultView,
                  DragComponent,
                })
              : defaultView;
            return <React.Fragment key={it.id}>{itemView}</React.Fragment>;
          })}
        </div>
      );

      return {
        key: category,
        label: category,
        children: contentView,
      };
    });
  }, [dataSource, renderItem]);

  if (!dataSource.length) {
    return null;
  }

  return (
    <div className={styles.ListBox}>
      <Collapse style={{ width: '100%' }} defaultActiveKey={defaultActiveKey} items={items}></Collapse>
    </div>
  );
};
