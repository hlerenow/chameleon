import { CustomSchemaForm } from '@/component/CustomSchemaForm';

export const DynamicObjectForm = () => {
  return (
    <CustomSchemaForm
      initialValue={{ header: [] }}
      properties={[
        {
          title: 'Headers',
          name: 'header',
          valueType: 'array',
          setters: [
            {
              componentName: 'ArraySetter',
              props: {
                collapse: {
                  open: true,
                },
                sortLabelKey: 'key',
                item: {
                  setters: [
                    {
                      componentName: 'ShapeSetter',
                      props: {
                        collapse: {
                          open: true,
                        },
                        elements: [
                          {
                            name: 'key',
                            title: 'Key',
                            valueType: 'string',
                            setters: ['StringSetter'],
                          },
                          {
                            name: 'value',
                            title: '值',
                            valueType: 'boolean',
                            setters: ['StringSetter', 'ExpressionSetter', 'FunctionSetter'],
                          },
                        ],
                      },
                      initialValue: {},
                    },
                  ],
                  initialValue: {
                    name: '',
                    status: {
                      value: true,
                    },
                  },
                },
              },

              initialValue: [],
            },
            'JSONSetter',
            'FunctionSetter',
          ],
        },
      ]}
      defaultSetterConfig={{}}
      onSetterChange={function (keyPaths: string[], setterName: string): void {}}
    ></CustomSchemaForm>
  );
};
