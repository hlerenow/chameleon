import React from 'react';
import { CNode, CRootNode } from '@chamn/model';
import styles from '../Canvas/style.module.scss';

export const GhostView = ({ node }: { node: CNode | CRootNode }) => {
  const label = node.value.title || node.material?.value.title || node.value.componentName;

  return (
    <div className={styles.ghostView} role="presentation">
      <span className={styles.ghostLabel}>{label}</span>
    </div>
  );
};
