import React, { useRef, useState } from 'react';
import { Button, ConfigProvider, Modal } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { EditorType, MonacoEditor, MonacoEditorInstance } from '../../../../MonacoEditor';
import DefaultTslibSource from './defaultDts?raw';
import { CNodePropsTypeEnum } from '@chamn/model';

export const FunctionSetter: CSetter<any> = ({
  onValueChange,
  initialValue,
  setterContext,
  editorOptions,
  ...props
}: CSetterProps<{
  mode: 'modal' | 'inline';
  containerStyle?: React.CSSProperties;
  minimap?: boolean;
  lineNumber?: 'on' | 'off';
  editorOptions?: EditorType['options'];
}>) => {
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const [open, setOpen] = useState(false);
  const onInnerValueChange = () => {
    const newValStr = editorRef.current?.getValue() || '';
    onValueChange?.({
      type: CNodePropsTypeEnum.FUNCTION,
      value: newValStr,
    });
  };
  const editorView = (
    <MonacoEditor
      beforeMount={(monaco) => {
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: false,
        });

        // compiler options
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES5,
          allowNonTsExtensions: true,
        });

        const libUri = 'ts:filename/chameleon.default.variable.d.ts';
        monaco.languages.typescript.javascriptDefaults.addExtraLib(DefaultTslibSource, libUri);
        // When resolving definitions and references, the editor will try to use created models.
        // Creating a model for the library allows "peek definition/references" commands to work with the library.
        const model = monaco.editor.getModel(monaco.Uri.parse(libUri));
        if (!model) {
          monaco.editor.createModel(DefaultTslibSource, 'typescript', monaco.Uri.parse(libUri));
        }
      }}
      onDidMount={(editor) => {
        editorRef.current = editor;
      }}
      initialValue={props.value?.value ?? (initialValue || '')}
      language={'javascript'}
      options={{
        automaticLayout: true,
        tabSize: 2,
        lineNumbers: props.lineNumber ?? 'on',
        minimap: {
          enabled: props.minimap ?? true,
        },
        ...(editorOptions || {}),
      }}
      onChange={() => {
        if (props.mode === 'inline') {
          // TODO: 需要节流每 1 秒触发一次
          onInnerValueChange();
        }
      }}
    />
  );

  if (props.mode === 'inline') {
    return (
      <div
        style={{
          border: '1px solid rgba(0,0,0, 0.2)',
          ...(props.containerStyle || {}),
        }}
      >
        {editorView}
      </div>
    );
  }
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
        Edit Function
      </Button>
      <Modal
        centered
        destroyOnClose
        open={open}
        title="Function Editor"
        onCancel={() => setOpen(false)}
        width="calc(100vw - 100px)"
        onOk={() => {
          onInnerValueChange();
          setOpen(false);
        }}
        style={{
          maxWidth: '1300px',
        }}
        styles={{
          body: {
            minHeight: '500px',
            height: 'calc(100vh - 280px)',
          },
        }}
      >
        <div style={{ height: '100%' }}>{open && editorView}</div>
      </Modal>
    </ConfigProvider>
  );
};

FunctionSetter.setterName = '函数设置器';
