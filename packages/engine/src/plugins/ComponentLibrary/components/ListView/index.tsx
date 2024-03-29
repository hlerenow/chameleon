import { useMemo } from 'react';
import { SnippetsType } from '@chamn/model';
import { Collapse } from 'antd';
import { DragComponentItem } from '../DragItem';
import styles from './style.module.scss';

export type ListViewProps = {
  dataSource: {
    name: string;
    list: SnippetsType[];
  }[];
};
export const ListView = (props: ListViewProps) => {
  const { dataSource } = props;
  const defaultActiveKey = dataSource.map((el) => el.name || '');

  const items = useMemo(() => {
    return dataSource.map((el) => {
      const category = el.name || '';
      const contentView = (
        <div className={styles.collapsePanel}>
          {el.list.map((it) => {
            return (
              <DragComponentItem
                id={it.id!}
                key={it.id!}
                name={it.title}
                icon={it.snapshot || it.snapshotText}
                iconText={it.snapshotText}
                description={it.description || ''}
              />
            );
          })}
        </div>
      );

      return {
        key: category,
        label: category,
        children: contentView,
      };
    });
  }, [dataSource]);

  if (!dataSource.length) {
    return null;
  }

  return (
    <div className={styles.ListBox}>
      <Collapse style={{ width: '100%' }} defaultActiveKey={defaultActiveKey} items={items}></Collapse>
    </div>
  );
};
