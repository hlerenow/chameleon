import React from 'react';
import { SnippetsType } from '@chamn/model';
import { Collapse } from 'antd';
import { DragComponentItem } from '../DragItem';
import styles from './style.module.scss';
const { Panel } = Collapse;

export type ListViewProps = {
  dataSource: {
    name: string;
    list: SnippetsType[];
  }[];
};
export const ListView = (props: ListViewProps) => {
  const { dataSource } = props;
  const defaultActiveKey = dataSource.map((el) => el.name || '');
  if (!dataSource.length) {
    return null;
  }
  return (
    <div className={styles.ListBox}>
      <Collapse style={{ width: '100%' }} defaultActiveKey={defaultActiveKey}>
        {dataSource.map((el) => {
          const category = el.name || '';
          const contentView = (
            <div className={styles.collapsePanel}>
              {el.list.map((it) => {
                return (
                  <DragComponentItem
                    id={it.id!}
                    key={it.id!}
                    name={it.title}
                    containerClassName={styles.itemBox}
                    icon={it.snapshot || it.snapshotText}
                    iconText={it.snapshotText}
                    description={it.description || ''}
                  />
                );
              })}
            </div>
          );
          return (
            <Panel header={category} key={category}>
              {contentView}
            </Panel>
          );
        })}
      </Collapse>
    </div>
  );
};
