import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CMaterialPropsType, CNode, CNodePropsTypeEnum, CProp, isExpression } from '@chamn/model';
import { CPluginCtx } from '../../core/pluginManager';
import { CRightPanelItem } from '../RightPanel/view';

import styles from './style.module.scss';
import { CSSPropertiesEditor, CSSPropertiesEditorRef } from '../../component/CSSPropertiesEditor';
import { Collapse } from 'antd';
import { CustomSchemaForm, CustomSchemaFormInstance } from '../../component/CustomSchemaForm';

type styleArr = {
  key: string;
  value: any;
}[];

const CSSBindPropsSchema: CMaterialPropsType<'CSSValueSetter'> = [
  {
    name: 'css',
    title: 'CSS Variable Bind',
    valueType: 'array',
    setters: [
      {
        componentName: 'ArraySetter',
        props: {
          item: {
            setters: [
              {
                componentName: 'ShapeSetter',
                props: {
                  elements: [
                    {
                      name: 'key',
                      title: '属性',
                      valueType: 'string',
                      setters: ['StringSetter'],
                      description: '',
                    },
                    {
                      name: 'value',
                      title: '置',
                      valueType: 'string',
                      setters: ['ExpressionSetter'],
                      description: '',
                    },
                  ],
                  collapse: false,
                },
                initialValue: {
                  key: '',
                  value: {
                    type: CNodePropsTypeEnum.EXPRESSION,
                    value: '',
                  },
                },
              },
            ],
            initialValue: {
              key: '',
              value: {
                type: CNodePropsTypeEnum.EXPRESSION,
                value: '',
              },
            },
          },
        },
        initialValue: [],
      },
    ],
  },
];

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

export const VisualPanel = (props: { node: CNode; pluginCtx: CPluginCtx }) => {
  const formRef = useRef<CustomSchemaFormInstance>(null);
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
      formRef.current?.setFields({
        css: expressionProperty,
      });
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
      <CustomSchemaForm
        pluginCtx={props.pluginCtx}
        key={node.id}
        defaultSetterConfig={node.value.configure.propsSetter || {}}
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        onSetterChange={() => {}}
        properties={CSSBindPropsSchema}
        initialValue={formatStyle.expressionProperty}
        ref={formRef}
        onValueChange={(val) => {
          onUpdateStyle([...formatStyle.normalProperty, ...val.css]);
        }}
      />
    </div>
  );
};

export const VisualPanelConfig: CRightPanelItem = {
  key: 'Visual',
  name: 'Visual',
  view: ({ node, pluginCtx }) => <VisualPanel node={node} pluginCtx={pluginCtx} />,
};
