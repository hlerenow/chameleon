import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CNode, CRootNode } from '@chamn/model';
import { CRightPanelItem, RightPanelOptions } from '../RightPanel/view';

import styles from './style.module.scss';
import {
  CSSPropertiesVariableBindEditor,
  CSSPropertiesVariableBindEditorRef,
} from '../../component/CSSPropertiesVariableBindEditor';
import { Collapse } from 'antd';
import { ClassNameEditor } from '@/component/ClassNameEditor';
import { CSSEditor, CSSEditorRef, CSSVal } from '@/component/CSSEditor';
import { formatCSSProperty, formatCssToNodeVal, formatNodeValToEditor, StyleArr, styleArr2Obj } from '@/utils/css';
import { CSSUIPanel, CSSUIPanelRef } from '@/component/CSSUIPanel';

export const VisualPanelPlus = (props: RightPanelOptions) => {
  const formRef = useRef<CSSPropertiesVariableBindEditorRef>(null);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const node = props.node!;

  const cssEditorRef = useRef<CSSEditorRef>(null);
  const cssUIRef = useRef<CSSUIPanelRef>(null);
  const [style, setStyle] = useState<Record<string, any>>({});
  const formatStyle = useMemo(() => {
    return formatCSSProperty(style);
  }, [style]);

  const lastNode = useRef<CNode | CRootNode>();

  const updatePanelValue = useCallback(() => {
    lastNode.current = node;
    const newStyle = node.value.style || {};
    setStyle(newStyle);
    const { allProperty } = formatCSSProperty(newStyle);
    const fCss = formatNodeValToEditor(node.value.css);
    const normalCss = fCss.normal?.normal;

    formRef.current?.setValue([...allProperty]);
    cssEditorRef.current?.setValue(fCss);
    // cssUIRef.current?.setValue(normalCss || {});
  }, [node]);
  useEffect(() => {
    updatePanelValue();
    node.emitter.on('onNodeChange', updatePanelValue);
    node.emitter.on('onReloadPage', updatePanelValue);
    return () => {
      node.emitter.off('onNodeChange', updatePanelValue);
      node.emitter.off('onReloadPage', updatePanelValue);
    };
  }, [node.emitter, node.id, props.activeTab, updatePanelValue]);

  const onUpdateStyle = (styleArr: StyleArr) => {
    // merge style
    const newStyle = styleArr2Obj([...styleArr]);
    setStyle(newStyle);
    // node.value.style = newStyle;
    // node.updateValue();
  };

  const onUpdateCss = (val: CSSVal) => {
    console.log('🚀 ~ file: index.tsx:61 ~ onUpdateCss ~ val:', val);
    // class name 不能以数字开头，这里使用c_前缀
    node.value.css = formatCssToNodeVal(`c_${node.id}`, val);
    node.updateValue();
  };

  // 只更新 normal 状态下的 normal css
  const onUpdateNormalCss = (newVal: Record<string, string>) => {
    const targetVal = node.value.css?.value.find((el) => el.state === 'normal');
    // if (targetVal) {
    //   targetVal.style = targetVal.style || {};
    //   Object.assign(targetVal.style, newVal);
    // } else {
    //   node.value.css = { value: [] };
    //   node.value.css?.value.push({
    //     state: 'normal',
    //     media: [],
    //     style: newVal,
    //   });
    // }
    // node.updateValue();
  };

  return (
    <div className={styles.visualPanelBox}>
      <div
        style={{
          marginBottom: '10px',
        }}
      >
        {/* <CSSUIPanel
          ref={cssUIRef}
          onValueChange={(newNormaCss) => {
            onUpdateNormalCss(newNormaCss);
          }}
        /> */}
        <CSSEditor handler={cssEditorRef} onValueChange={onUpdateCss} />
        {/* <div
          style={{
            paddingTop: '10px',
          }}
        >
          <ClassNameEditor
            onValueChange={(newVal) => {
              node.value.classNames = newVal;
              node.updateValue();
            }}
          />
        </div> */}

        {/* <Collapse
          bordered={false}
          style={{
            marginBottom: '10px',
          }}
          onChange={(val) => {
            if (val.length) {
              console.log('Style Variable change');
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
                    onUpdateStyle([...val]);
                  }}
                />
              ),
            },
          ]}
        ></Collapse> */}
      </div>
    </div>
  );
};

export const VisualPanelPlusConfig: CRightPanelItem = {
  key: 'VisualPanelPlus',
  name: 'Visual',
  view: ({ node, pluginCtx, activeTab }) => {
    if (node) {
      return <VisualPanelPlus node={node} pluginCtx={pluginCtx} activeTab={activeTab} />;
    } else {
      return <></>;
    }
  },
  show: (props) => {
    return props.node?.material?.value.advanceCustom?.rightPanel?.visual !== false;
  },
};
