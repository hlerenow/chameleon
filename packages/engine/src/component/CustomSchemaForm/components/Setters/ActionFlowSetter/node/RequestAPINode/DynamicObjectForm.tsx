import { CustomSchemaForm } from '@/component/CustomSchemaForm';

export const DynamicObjectForm = () => {
  return (
    <CustomSchemaForm
      initialValue={{ header: {} }}
      properties={[
        {
          title: 'Headers',
          name: 'header',
          valueType: 'array',
          setters: [
            {
              componentName: 'FunctionSetter',
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
              props: {
                mode: 'inline',
              },
            },
          ],
          labelAlign: 'start',
        },
      ]}
      defaultSetterConfig={{}}
      onSetterChange={function (keyPaths: string[], setterName: string): void {}}
    ></CustomSchemaForm>
  );
};
