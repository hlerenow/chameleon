import { SetterType } from '@chamn/model';

export const requestParamsSchemaSetterList: SetterType[] = [
  {
    componentName: 'JSONSetter',
    labelAlign: 'start',
    props: {
      mode: 'inline',
      lineNumbers: 'off',
      editorOptions: {
        lineNumbers: 'off',
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,
        glyphMargin: false,
      },
    },
  },
  {
    componentName: 'FunctionSetter',
    labelAlign: 'start',
    props: {
      mode: 'inline',
      minimap: false,
      containerStyle: {
        paddingTop: '10px',
        width: '470px',
        height: '150px',
      },
      lineNumber: false,
    },
  },
];

export const methodOptions = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
];
