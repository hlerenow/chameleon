import { useEffect, useMemo, useRef, useState } from 'react';
import { CMaterialPropsType, CNode, CNodePropsTypeEnum, CProp, isExpression } from '@chameleon/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';

import styles from './style.module.scss';
import { CSSPropertiesEditor, CSSPropertiesEditorRef } from '../../component/CSSPropertiesEditor';
import {
  CSSPropertiesVariableBindEditor,
  CSSPropertiesVariableBindEditorRef,
} from '../../component/CSSPropertiesVariableBindEditor';
import { Collapse } from 'antd';
import { CustomSchemaForm, CustomSchemaFormInstance } from '../../component/CustomSchemaForm';
import { ClassNameEditor } from '@/component/ClassNameEditor';

type styleArr = {
  key: string;
  value: any;
}[];

const formatProperty = (cssVal: Record<string, any>) => {
  const normalProperty: { key: string; value: string }[] = [];
  const expressionProperty: { key: string; value: any }[] = [];
  Object.keys(cssVal).forEach((key) => {
    const val = cssVal[key];
    if (isExpression(val)) {
      expressionProperty.push({
        key,
        value: val,
      });
    } else {
      normalProperty.push({
        key,
        value: val,
      });
    }
  });
  const res = {
    normalProperty,
    expressionProperty,
  };
  return res;
};

const styleArr2Obj = (val: styleArr) => {
  const res: Record<string, any> = {};
  val.forEach((item) => {
    res[item.key] = item.value;
  });
  return res;
};

export const VisualPanelPlus = (props: { node: CNode; pluginCtx: CPluginCtx }) => {
  const formRef = useRef<CSSPropertiesVariableBindEditorRef>(null);
  const { node } = props;
  const cssEditorRef = useRef<CSSPropertiesEditorRef>(null);
  const [style, setStyle] = useState<Record<string, string>>({});
  const formatStyle = useMemo(() => {
    return formatProperty(style);
  }, [style]);

  useEffect(() => {
    const handel = () => {
      const newStyle = node.getPlainProps?.()['style'] || {};
      setStyle(newStyle);
      const { normalProperty, expressionProperty } = formatProperty(newStyle);
      cssEditorRef.current?.setValue(normalProperty);
      formRef.current?.setValue(expressionProperty);
    };
    handel();
    node.emitter.on('onNodeChange', handel);
    () => {
      node.emitter.off('onNodeChange', handel);
    };
  }, [node]);

  const onUpdateStyle = (styleArr: styleArr) => {
    // merge style
    const newStyle = styleArr2Obj([...styleArr]);
    setStyle(newStyle);
    if (node.value.props.style) {
      node.value.props.style.updateValue(newStyle);
    } else {
      node.value.props.style = new CProp('style', newStyle, {
        parent: node,
        materials: node.materialsModel,
      });
      node.updateValue();
    }
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
        <Collapse.Panel header={<span className={styles.header}>CSS Source</span>} key="origin-css-edit">
          <CSSPropertiesEditor
            key={node.id}
            ref={cssEditorRef}
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
        <Collapse.Panel header={<span className={styles.header}>CSS Variable Bind</span>} key="origin-css-edit">
          <CSSPropertiesVariableBindEditor
            ref={formRef}
            initialValue={formatStyle.expressionProperty}
            onValueChange={(val) => {
              console.log('🚀 ~ file: index.tsx:128 ~ VisualPanelPlus ~ val:', val);
              onUpdateStyle([...formatStyle.normalProperty, ...val]);
            }}
          />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export const VisualPanelPlusConfig: CRightPanelItem = {
  key: 'VisualPanelPlus',
  name: 'VisualPanelPlus',
  view: ({ node, pluginCtx }) => <VisualPanelPlus node={node} pluginCtx={pluginCtx} />,
};
