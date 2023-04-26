import { forwardRef } from 'react';
import { ConfigProvider } from 'antd';
import { CustomSchemaForm } from '../CustomSchemaForm';
import { ClassNameType, CMaterialPropsType, CNodePropsTypeEnum } from '@chamn/model';
import React from 'react';

import styles from './style.module.scss';

export type ClassNameEditorProps = {
  initialValue?: { key: string; value: string }[];
  onValueChange?: (val: ClassNameType[]) => void;
};
export type ClassNameEditorRef = {
  setValue: (val: { key: string; value: string }[]) => void;
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
                      setters: ['ExpressionSetter'],
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
