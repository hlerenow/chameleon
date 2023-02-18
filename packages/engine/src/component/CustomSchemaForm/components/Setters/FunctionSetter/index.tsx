import React, { useRef, useState } from 'react';
import { Button, ConfigProvider, Modal } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { MonacoEditor, MonacoEditorInstance } from '../../../../MonacoEditor';
import { DefaultTslibSource } from './defaultDts';
import { CNodePropsTypeEnum } from '@chameleon/model';

export const FunctionSetter: CSetter<any> = ({
  onValueChange,
  setterContext,
  ...props
}: CSetterProps<any>) => {
  const { keyPaths, onSetterChange } = setterContext;
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  console.log('setterContext', setterContext);
  const [open, setOpen] = useState(false);
  const onInnerValueChange = () => {
    const newValStr = editorRef.current?.getValue() || '';
    onValueChange({
      type: CNodePropsTypeEnum.FUNCTION,
      value: newValStr,
    });
  };
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 4,
        },
      }}
    >
      <Button
        size="small"
        style={{
          marginTop: '5px',
          width: '100%',
          color: '#676767',
          fontSize: '12px',
        }}
        onClick={() => {
          setOpen(true);
        }}
      >
        Edit
      </Button>
      <Modal
        destroyOnClose
        open={open}
        title="Function Editor"
        width="800px"
        onCancel={() => setOpen(false)}
        onOk={() => {
          onInnerValueChange();
          setOpen(false);
        }}
        style={{}}
      >
        <div style={{ height: '500px' }}>
          {open && (
            <MonacoEditor
              beforeMount={(monaco) => {
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions(
                  {
                    noSemanticValidation: true,
                    noSyntaxValidation: false,
                  }
                );

                // compiler options
                monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
                  {
                    target: monaco.languages.typescript.ScriptTarget.ES5,
                    allowNonTsExtensions: true,
                  }
                );

                const libUri = 'ts:filename/chameleon.default.variable.d.ts';
                monaco.languages.typescript.javascriptDefaults.addExtraLib(
                  DefaultTslibSource,
                  libUri
                );
                // When resolving definitions and references, the editor will try to use created models.
                // Creating a model for the library allows "peek definition/references" commands to work with the library.
                const model = monaco.editor.getModel(monaco.Uri.parse(libUri));
                if (!model) {
                  monaco.editor.createModel(
                    DefaultTslibSource,
                    'typescript',
                    monaco.Uri.parse(libUri)
                  );
                }
              }}
              onDidMount={(editor) => {
                editorRef.current = editor;
              }}
              initialValue={props.value?.value || ''}
              language={'javascript'}
              options={{
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          )}
        </div>
      </Modal>
    </ConfigProvider>
  );
};

FunctionSetter.setterName = '函数 设置器';
