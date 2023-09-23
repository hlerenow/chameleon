import React from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { ConfigProvider } from 'antd';
import { CustomSchemaForm, CustomSchemaFormInstance } from '../CustomSchemaForm';
import { ClassNameType, CMaterialPropsType, CNodePropsTypeEnum } from '@chamn/model';

import styles from './style.module.scss';

export type ClassNameEditorProps = {
  initialValue?: ClassNameType[];
  onValueChange?: (val: ClassNameType[]) => void;
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
          item: {
            setters: [
              {
                componentName: 'ShapeSetter',
                props: {
                  collapse: false,
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
              status: {
                type: CNodePropsTypeEnum.EXPRESSION,
                value: true,
              },
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
          properties={properties}
          // eslint-disable-next-line @typescript-eslint/no-empty-function
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
