import { useEffect, useMemo, useRef, useState } from 'react';
import { CNode, CRootNode } from '@chamn/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem, RightPanelOptions } from '../RightPanel/view';

import styles from './style.module.scss';
import {
  CSSPropertiesVariableBindEditor,
  CSSPropertiesVariableBindEditorRef,
} from '../../component/CSSPropertiesVariableBindEditor';
import { Collapse, Radio } from 'antd';
import { ClassNameEditor } from '@/component/ClassNameEditor';
import { CSSEditor, CSSEditorRef, CSSVal } from '@/component/CSSEditor';
import { formatCSSProperty, formatCssToNodeVal, formatNodeValToEditor, StyleArr, styleArr2Obj } from '@/utils/css';
import { waitReactUpdate } from '@/utils';
import { CSSUIPanel } from '@/component/CSSUIPanel';

export const VisualPanelPlus = (props: RightPanelOptions) => {
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
  const updatePanelValue = () => {
    lastNode.current = node;
    const newStyle = node.value.style || {};
    setStyle(newStyle);
    const { allProperty } = formatCSSProperty(newStyle);
    const fCss = formatNodeValToEditor(node.value.css);
    waitReactUpdate({
      cb: () => {
        formRef.current?.setValue([...allProperty]);
        cssEditorRef.current?.setValue(fCss);
      },
    });
  };
  useEffect(() => {
    updatePanelValue();
    node.emitter.on('onNodeChange', updatePanelValue);
    node.emitter.on('onReloadPage', updatePanelValue);
    () => {
      node.emitter.off('onNodeChange', updatePanelValue);
      node.emitter.off('onReloadPage', updatePanelValue);
    };
  }, [node.id, props.activeTab]);

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
        <CSSUIPanel />
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
        onChange={(val) => {
          if (val.length) {
            updatePanelValue();
          }
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
  view: ({ node, pluginCtx, activeTab }) => <VisualPanelPlus node={node} pluginCtx={pluginCtx} activeTab={activeTab} />,
  show: (props) => {
    return props.node?.material?.value.advanceCustom?.rightPanel?.visual !== false;
  },
};
