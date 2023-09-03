import { useEffect, useMemo, useRef, useState } from 'react';
import { CNode, CRootNode } from '@chamn/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';

import styles from './style.module.scss';
import {
  CSSPropertiesVariableBindEditor,
  CSSPropertiesVariableBindEditorRef,
} from '../../component/CSSPropertiesVariableBindEditor';
import { Collapse } from 'antd';
import { ClassNameEditor } from '@/component/ClassNameEditor';
import { CSSEditor, CSSEditorRef, CSSVal } from '@/component/CSSEditor';
import { formatCSSProperty, formatCssToNodeVal, formatNodeValToEditor, StyleArr, styleArr2Obj } from '@/utils/css';

export const VisualPanelPlus = (props: { node: CNode | CRootNode | null; pluginCtx: CPluginCtx }) => {
  const formRef = useRef<CSSPropertiesVariableBindEditorRef>(null);
  const node = props.node;
  if (!node) {
    return <></>;
  }
  const cssEditorRef = useRef<CSSEditorRef>(null);
  const [style, setStyle] = useState<Record<string, any>>({});
  const formatStyle = useMemo(() => {
    return formatCSSProperty(style);
  }, [style]);

  const lastNode = useRef<CNode | CRootNode>();
  useEffect(() => {
    const handel = () => {
      lastNode.current = node;
      const newStyle = node.value.style || {};
      setStyle(newStyle);
      const { expressionProperty } = formatCSSProperty(newStyle);
      formRef.current?.setValue(expressionProperty);
      const fCss = formatNodeValToEditor(node.value.css);
      cssEditorRef.current?.setValue(fCss);
    };
    handel();
    node.emitter.on('onNodeChange', handel);
    node.emitter.on('onReloadPage', handel);
    () => {
      node.emitter.off('onNodeChange', handel);
      node.emitter.off('onReloadPage', handel);
    };
  }, [node.id]);

  const onUpdateStyle = (styleArr: StyleArr) => {
    // merge style
    const newStyle = styleArr2Obj([...styleArr]);
    setStyle(newStyle);
    node.value.style = newStyle;
    node.updateValue();
  };

  const onUpdateCss = (val: CSSVal) => {
    // class name 不能以数字开头，这里使用c_前缀
    node.value.css = formatCssToNodeVal(`c_${node.id}`, val);
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
        // defaultActiveKey={['origin-css-edit']}
        bordered={false}
        style={{
          marginBottom: '10px',
        }}
        items={[
          {
            key: 'origin-css-edit',
            label: <span className={styles.header}>Style Variable</span>,
            children: (
              <CSSPropertiesVariableBindEditor
                ref={formRef}
                initialValue={formatStyle.expressionProperty}
                onValueChange={(val) => {
                  onUpdateStyle([...formatStyle.normalProperty, ...val]);
                }}
              />
            ),
          },
        ]}
      ></Collapse>
      <CSSEditor handler={cssEditorRef} onValueChange={onUpdateCss} />
    </div>
  );
};

export const VisualPanelPlusConfig: CRightPanelItem = {
  key: 'VisualPanelPlus',
  name: 'Visual',
  view: ({ node, pluginCtx }) => <VisualPanelPlus node={node} pluginCtx={pluginCtx} />,
  show: (props) => {
    return props.node?.material?.value.advanceCustom?.rightPanel?.visual !== false;
  },
};
