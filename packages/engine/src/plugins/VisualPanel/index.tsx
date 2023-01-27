import React, { useEffect, useRef, useState } from 'react';
import { CNode, CProp } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';

import styles from './style.module.scss';
import {
  CSSPropertiesEditor,
  CSSPropertiesEditorRef,
} from '../../component/CSSPropertiesEditor';

export const VisualPanel = (props: { node: CNode; pluginCtx: CPluginCtx }) => {
  const { node } = props;
  const cssEditorRef = useRef<CSSPropertiesEditorRef>(null);
  const [style, setStyle] = useState<Record<string, string>>({});
  useEffect(() => {
    const newStyle = node.getPlainProps()['style'] || {};
    cssEditorRef.current?.setValue(newStyle);
    setStyle(newStyle);
    console.log('change node', node, newStyle);
  }, [node]);

  const onUpdateStyle = (style: Record<string, string>) => {
    setStyle(style);
    if (node.value.props.style) {
      node.value.props.style.updateValue(style);
    } else {
      node.value.props.style = new CProp('style', style, {
        parent: node,
        materials: node.materialsModel,
      });
      node.updateValue();
    }
  };

  return (
    <div className={styles.visualPanelBox}>
      <CSSPropertiesEditor
        ref={cssEditorRef}
        onValueChange={onUpdateStyle}
        initialValue={style}
      />
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
