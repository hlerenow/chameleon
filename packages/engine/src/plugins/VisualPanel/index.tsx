import React, { useEffect, useRef, useState } from 'react';
import { CNode } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';

import styles from './style.module.scss';
import { CSSPropertiesEditor } from '../../component/CSSPropertiesEditor';

export const VisualPanel = (props: { node: CNode; pluginCtx: CPluginCtx }) => {
  const { node } = props;

  return (
    <div className={styles.visualPanelBox}>
      <CSSPropertiesEditor />
    </div>
  );
};

export const VisualPanelConfig: CRightPanelItem = {
  key: 'Visual',
  name: 'Visual',
  view: ({ node, pluginCtx }) => (
    <VisualPanel node={node} pluginCtx={pluginCtx} />
  ),
};
