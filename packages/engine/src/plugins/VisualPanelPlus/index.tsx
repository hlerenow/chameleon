import { useEffect, useMemo, useRef, useState } from 'react';
import { CNode } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';

import styles from './style.module.scss';
import { CSSPropertiesEditor, CSSPropertiesEditorRef } from '../../component/CSSPropertiesEditor';
import {
  CSSPropertiesVariableBindEditor,
  CSSPropertiesVariableBindEditorRef,
} from '../../component/CSSPropertiesVariableBindEditor';
import { Collapse } from 'antd';
import { ClassNameEditor } from '@/component/ClassNameEditor';
import { CSSEditor, CSSEditorRef, CSSVal } from '@/component/CSSEditor';
import { formatCSSProperty, formatCssToNodeVal, formatNodeValToEditor, StyleArr, styleArr2Obj } from '@/utils/css';

export const VisualPanelPlus = (props: { node: CNode; pluginCtx: CPluginCtx }) => {
  const formRef = useRef<CSSPropertiesVariableBindEditorRef>(null);
  const { node } = props;
  const cssPropertyEditorRef = useRef<CSSPropertiesEditorRef>(null);
  const cssEditorRef = useRef<CSSEditorRef>(null);
  const [style, setStyle] = useState<Record<string, any>>({});
  const formatStyle = useMemo(() => {
    return formatCSSProperty(style);
  }, [style]);

  const lastNode = useRef<CNode>();
  useEffect(() => {
    const handel = () => {
      if (lastNode.current?.id === node.id) {
        return;
      }
      lastNode.current = node;
      const newStyle = node.value.style || {};
      setStyle(newStyle);
      const { normalProperty, expressionProperty } = formatCSSProperty(newStyle);
      cssPropertyEditorRef.current?.setValue(normalProperty);
      formRef.current?.setValue(expressionProperty);
      const fCss = formatNodeValToEditor(node.value.css);
      cssEditorRef.current?.setValue(fCss);
    };
    handel();
    node.emitter.on('onNodeChange', handel);
    () => {
      node.emitter.off('onNodeChange', handel);
    };
  }, [node]);

  const onUpdateStyle = (styleArr: StyleArr) => {
    // merge style
    const newStyle = styleArr2Obj([...styleArr]);
    setStyle(newStyle);
    node.value.style = newStyle;
    node.updateValue();
  };

  const onUpdateCss = (val: CSSVal) => {
    node.value.css = formatCssToNodeVal(node.id, val);
    node.updateValue();
  };

  return (
    <div className={styles.visualPanelBox}>
      <div
        style={{
          marginBottom: '10px',
        }}
      >
        <ClassNameEditor
          onValueChange={(newVal) => {
            node.value.classNames = newVal;
            node.updateValue();
          }}
        />
      </div>
      <Collapse
        defaultActiveKey={['origin-css-edit']}
        bordered={false}
        style={{
          marginBottom: '10px',
        }}
      >
        <Collapse.Panel header={<span className={styles.header}>Style</span>} key="origin-css-edit">
          <CSSPropertiesEditor
            key={node.id}
            ref={cssPropertyEditorRef}
            onValueChange={(val) => {
              onUpdateStyle([...val, ...formatStyle.expressionProperty]);
            }}
            initialValue={formatStyle.normalProperty}
          />
        </Collapse.Panel>
      </Collapse>
      <Collapse
        defaultActiveKey={['origin-css-edit']}
        bordered={false}
        style={{
          marginBottom: '10px',
        }}
      >
        <Collapse.Panel header={<span className={styles.header}>Style Variable Bind</span>} key="origin-css-edit">
          <CSSPropertiesVariableBindEditor
            ref={formRef}
            initialValue={formatStyle.expressionProperty}
            onValueChange={(val) => {
              onUpdateStyle([...formatStyle.normalProperty, ...val]);
            }}
          />
        </Collapse.Panel>
      </Collapse>
      <CSSEditor handler={cssEditorRef} onValueChange={onUpdateCss} />
    </div>
  );
};

export const VisualPanelPlusConfig: CRightPanelItem = {
  key: 'VisualPanelPlus',
  name: 'VisualPanel',
  view: ({ node, pluginCtx }) => <VisualPanelPlus node={node} pluginCtx={pluginCtx} />,
};
