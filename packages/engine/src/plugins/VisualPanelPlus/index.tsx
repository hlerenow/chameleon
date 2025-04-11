/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { CNode, CRootNode } from '@chamn/model';
import { CRightPanelItem, RightPanelOptions } from '../RightPanel/view';

import styles from './style.module.scss';
import {
  CSSPropertiesVariableBindEditor,
  CSSPropertiesVariableBindEditorRef,
} from '../../component/CSSPropertiesVariableBindEditor';
import { Collapse } from 'antd';
import { ClassNameEditor, ClassNameEditorRef } from '@/component/ClassNameEditor';
import { CSSEditor, CSSEditorRef, CSSVal } from '@/component/CSSEditor';
import {
  formatStyleProperty,
  formatCssToNodeVal,
  formatNodeValToEditor,
  StyleArr,
  styleArr2Obj,
  styleObjToArr,
} from '@/utils/css';
import { StyleUIPanel, StyleUIPanelRef } from '@/component/StylePanel';

export const VisualPanelPlus = (props: RightPanelOptions) => {
  const styleVariableRef = useRef<CSSPropertiesVariableBindEditorRef>(null);

  const node = props.node!;
  const classNameList = useMemo(() => {
    const tempList = node.value.classNames || [];
    return tempList;
  }, [node]);
  const cssEditorRef = useRef<CSSEditorRef>(null);
  const cssUIRef = useRef<StyleUIPanelRef>(null);
  const classNameEditorRef = useRef<ClassNameEditorRef>(null);
  const formatStyle = useMemo(() => {
    return formatStyleProperty(node.value.style || []);
  }, [node.value.style]);

  const lastNode = useRef<CNode | CRootNode>();

  const updatePanelValue = useCallback(() => {
    lastNode.current = node;
    const newStyle = node.value.style || [];
    const { expressionProperty, normalProperty } = formatStyleProperty(newStyle);
    const fCss = formatNodeValToEditor(node.value.css);
    styleVariableRef.current?.setValue([...expressionProperty]);
    cssEditorRef.current?.setValue(fCss);
    classNameEditorRef.current?.setValue(node.value.classNames || []);
    cssUIRef.current?.setValue(styleArr2Obj(normalProperty) || {});
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

  const onUpdateStyleVariable = (styleArr: StyleArr) => {
    // merge style
    const newStyleList = [...formatStyle.normalProperty, ...styleArr];
    node.value.style = newStyleList;
    node.updateValue();
  };

  const onUpdateStyle = (styleArr: StyleArr) => {
    // merge style
    const newStyleList = [...styleArr, ...formatStyle.expressionProperty];
    node.value.style = newStyleList;
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
        <StyleUIPanel
          ref={cssUIRef}
          onValueChange={(newNormaCss) => {
            onUpdateStyle(styleObjToArr(newNormaCss));
          }}
        />
        <Collapse
          bordered={false}
          style={{
            marginBottom: '10px',
          }}
          defaultActiveKey={['origin-css-edit']}
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
                  ref={styleVariableRef}
                  initialValue={formatStyle.expressionProperty}
                  onValueChange={(val) => {
                    onUpdateStyleVariable(val);
                  }}
                />
              ),
            },
          ]}
        ></Collapse>
        <div
          style={{
            paddingTop: '10px',
          }}
        >
          <ClassNameEditor
            nodeModel={props.node as any}
            initialValue={classNameList}
            ref={classNameEditorRef}
            pluginContext={props.pluginCtx}
            onValueChange={(newVal) => {
              node.value.classNames = newVal;
              node.updateValue();
            }}
          />
        </div>
        <CSSEditor handler={cssEditorRef} onValueChange={onUpdateCss} />
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
