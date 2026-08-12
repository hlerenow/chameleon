import React from 'react';
import { CNode, CRootNode } from '@chamn/model';
import styles from '../Canvas/style.module.scss';

export const GhostView = ({ node }: { node: CNode | CRootNode }) => {
  return (
    <div className={styles.ghostView} role="presentation">
      <span className={styles.ghostLabel}>{node.value.componentName}</span>
    </div>
  );
};
