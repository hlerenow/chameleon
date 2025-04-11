import { forwardRef, useImperativeHandle, useRef } from 'react';
import { ConfigProvider } from 'antd';
import { CustomSchemaForm, CustomSchemaFormInstance } from '../CustomSchemaForm';
import { ClassNameType, CMaterialPropsType, CNode } from '@chamn/model';
import { CPluginCtx } from '@/core/pluginManager';

export type ClassNameEditorProps = {
  initialValue?: ClassNameType[];
  onValueChange?: (val: ClassNameType[]) => void;
  pluginContext: CPluginCtx;
  nodeModel: CNode;
};
export type ClassNameEditorRef = {
  setValue: (val: ClassNameType[]) => void;
};

const properties: CMaterialPropsType = [
  {
    title: 'Class Names',
    name: 'className',
    valueType: 'array',

    setters: [
      {
        componentName: 'ArraySetter',
        props: {
          sortLabelKey: 'name',
          collapse: {
            open: true,
          },
          item: {
            setters: [
              {
                componentName: 'ShapeSetter',
                props: {
                  elements: [
                    {
                      name: 'name',
                      title: '类名',
                      valueType: 'string',
                      setters: ['StringSetter'],
                    },
                    {
                      name: 'status',
                      title: '启用',
                      valueType: 'boolean',
                      setters: ['BooleanSetter', 'ExpressionSetter'],
                    },
                  ],
                },
                initialValue: {},
              },
            ],
            initialValue: {
              name: '',
              status: true,
            },
          },
        },
        initialValue: [],
      },
    ],
  },
];

export const ClassNameEditor = forwardRef<ClassNameEditorRef, ClassNameEditorProps>(function CSSPropertiesEditorCore(
  props,
  ref
) {
  const formRef = useRef<CustomSchemaFormInstance>(null);
  useImperativeHandle(ref, () => {
    return {
      setValue(newValue) {
        formRef?.current?.setFields({
          className: newValue || [],
        });
      },
    };
  });
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <div>
        <CustomSchemaForm
          ref={formRef}
          initialValue={[]}
          nodeId={props.nodeModel.id}
          pluginCtx={props.pluginContext}
          properties={properties}
          onSetterChange={function () {}}
          onValueChange={(newVal) => {
            props.onValueChange?.(newVal.className || []);
          }}
          defaultSetterConfig={{}}
        ></CustomSchemaForm>
      </div>
    </ConfigProvider>
  );
});
