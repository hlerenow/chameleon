import { CustomSchemaForm } from '@/component/CustomSchemaForm';
import { CMaterialPropsType } from '@chamn/model';
import { useCallback } from 'react';

const properties: CMaterialPropsType = [
  {
    title: 'Headers',
    name: 'header',
    valueType: 'array',
    setters: [
      {
        componentName: 'FunctionSetter',
        labelAlign: 'start',
        props: {
          mode: 'inline',
          minimap: false,
          lineNumber: 'off',
          containerStyle: {
            width: '400px',
            height: '200px',
          },
          editorOptions: {
            lineNumbers: 'off',
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            glyphMargin: false,
          },
        },
      },
      {
        componentName: 'JSONSetter',
        labelAlign: 'start',
        props: {
          mode: 'inline',
        },
      },
    ],
  },
];
export const DynamicObjectForm = () => {
  const onSetterChange = useCallback(() => {}, []);
  return (
    <CustomSchemaForm
      initialValue={{ header: {} }}
      properties={properties}
      defaultSetterConfig={{}}
      onSetterChange={onSetterChange}
    ></CustomSchemaForm>
  );
};
