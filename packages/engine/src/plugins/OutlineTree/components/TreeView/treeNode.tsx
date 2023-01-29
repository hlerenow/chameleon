import React from 'react';
import { TreeNodeData } from './dataStruct';
import styles from './style.module.scss';

export const DRAG_ITEM_KEY = 'data-drag-key';

export type TreeNodeProps = {
  item: TreeNodeData;
  level?: number;
  paths?: (string | number)[];
};
export class TreeNode extends React.Component<TreeNodeProps> {
  componentDidMount(): void {
    const { props } = this;
  }

  render() {
    const { level = 0, item, paths = ['0'] } = this.props;

    return (
      <div className={styles.nodeBox}>
        <div className={styles.nodeContent} data-drag-key={item.key}>
          {item.title}
        </div>
        <div className={styles.nodeChildren} style={{ paddingLeft: '20px' }}>
          {item.children?.map((el, index) => {
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
  }
}
