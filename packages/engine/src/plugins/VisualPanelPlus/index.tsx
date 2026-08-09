/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useRef } from 'react';
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
  const classNameList = node.value.classNames || [];
  const cssEditorRef = useRef<CSSEditorRef>(null);
  const cssUIRef = useRef<StyleUIPanelRef>(null);
  const classNameEditorRef = useRef<ClassNameEditorRef>(null);
  const skipPanelSyncRef = useRef(false);
  const panelSyncFrameRef = useRef<number | null>(null);
  const getStyleParts = useCallback(() => formatStyleProperty(node.value.style || []), [node]);

  const updatePanelValue = useCallback(() => {
    if (skipPanelSyncRef.current) {
      skipPanelSyncRef.current = false;
      return;
    }

    const newStyle = node.value.style || [];
    const { expressionProperty, normalProperty } = formatStyleProperty(newStyle);
    const fCss = formatNodeValToEditor(node.value.css);
    styleVariableRef.current?.setValue([...expressionProperty]);
    cssEditorRef.current?.setValue(fCss);
    classNameEditorRef.current?.setValue(node.value.classNames || []);
    cssUIRef.current?.setValue(styleArr2Obj(normalProperty) || {});
  }, [node]);

  const commitNodeUpdate = useCallback((update: () => void) => {
    skipPanelSyncRef.current = true;
    try {
      update();
    } finally {
      skipPanelSyncRef.current = false;
    }
  }, []);

  const schedulePanelSync = useCallback(() => {
    if (skipPanelSyncRef.current || panelSyncFrameRef.current !== null) {
      return;
    }

    panelSyncFrameRef.current = window.requestAnimationFrame(() => {
      panelSyncFrameRef.current = null;
      updatePanelValue();
    });
  }, [updatePanelValue]);

  useEffect(() => {
    updatePanelValue();
    const handleNodeChange = ({ node: changedNode }: { node?: { id?: string } }) => {
      if (changedNode === node || changedNode?.id === node.id) {
        schedulePanelSync();
      }
    };
    node.emitter.on('onNodeChange', handleNodeChange);
    node.emitter.on('onReloadPage', schedulePanelSync);
    return () => {
      node.emitter.off('onNodeChange', handleNodeChange);
      node.emitter.off('onReloadPage', schedulePanelSync);
      if (panelSyncFrameRef.current !== null) {
        window.cancelAnimationFrame(panelSyncFrameRef.current);
        panelSyncFrameRef.current = null;
      }
    };
  }, [node, props.activeTab, schedulePanelSync, updatePanelValue]);

  const onUpdateStyleVariable = (styleArr: StyleArr) => {
    // merge style
    const { normalProperty } = getStyleParts();
    commitNodeUpdate(() => {
      node.value.style = [...normalProperty, ...styleArr];
      node.updateValue();
    });
  };

  const onUpdateStyle = (styleArr: StyleArr) => {
    // merge style
    const { expressionProperty } = getStyleParts();
    commitNodeUpdate(() => {
      node.value.style = [...styleArr, ...expressionProperty];
      node.updateValue();
    });
  };

  const onUpdateCss = (val: CSSVal) => {
    // class name 不能以数字开头，这里使用c_前缀
    commitNodeUpdate(() => {
      node.value.css = formatCssToNodeVal(`c_${node.id}`, val);
      node.updateValue();
    });
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
                  initialValue={getStyleParts().expressionProperty}
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
              commitNodeUpdate(() => {
                node.value.classNames = newVal;
                node.updateValue();
              });
            }}
          />
        </div>
        <CSSEditor
          handler={cssEditorRef}
          onValueChange={onUpdateCss}
          responsiveSizes={props.pluginCtx.engine.props.responsiveSizes}
        />
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
