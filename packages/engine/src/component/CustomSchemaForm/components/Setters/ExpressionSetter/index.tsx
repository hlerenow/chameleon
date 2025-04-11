import React, { useRef, useState } from 'react';
import { Button, ConfigProvider, Modal } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { EditorType, MonacoEditor, MonacoEditorInstance } from '../../../../MonacoEditor';
import DefaultTslibSource from '../FunctionSetter//defaultDts?raw';
import { CNodePropsTypeEnum } from '@chamn/model';
import styles from './style.module.scss';
import { getPageTypeDefined } from '../FunctionSetter/helper';
export type ExpressionSetterProps = CSetterProps<{
  value: {
    type: string;
    value: string;
  };
  mode: 'modal' | 'inline';
  containerStyle?: React.CSSProperties;
  minimap?: boolean;
  lineNumber?: boolean;
  editorOptions?: EditorType['options'];
}>;

export const ExpressionSetter: CSetter<ExpressionSetterProps> = ({
  onValueChange,
  initialValue,
  setterContext,
  editorOptions,

  mode = 'modal',
  ...props
}) => {
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const [open, setOpen] = useState(false);
  const onInnerValueChange = () => {
    const newValStr = editorRef.current?.getValue() || '';
    onValueChange?.({
      type: CNodePropsTypeEnum.EXPRESSION,
      value: newValStr,
    });
  };

  let lineNumberOptions = {};
  if (props.lineNumber === false || mode === 'inline') {
    lineNumberOptions = {
      lineNumbers: 'off',
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0,
      glyphMargin: false,
    };
  }

  const editorView = (
    <MonacoEditor
      beforeMount={async (monaco) => {
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: true,
          noSyntaxValidation: false,
        });

        // compiler options
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES5,
          allowNonTsExtensions: true,
        });

        const realtimeDts = await getPageTypeDefined(setterContext.pluginCtx.pageModel, setterContext.nodeModel);

        const libUri = 'ts:filename/chameleon.default.variable.d.ts';
        monaco.languages.typescript.javascriptDefaults.addExtraLib(realtimeDts, libUri);
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
      initialValue={props.value?.value ?? initialValue}
      language={'javascript'}
      options={{
        automaticLayout: true,
        tabSize: 2,
        minimap: { enabled: false },
        folding: false,
        hover: {
          // enabled: false, // ✅ 禁用 hoverWidget
        },
        ...lineNumberOptions,
        ...(editorOptions || {}),
      }}
      onChange={() => {
        if (mode === 'inline') {
          // TODO: 需要节流每 1 秒触发一次
          onInnerValueChange();
        }
      }}
    />
  );

  if (mode === 'inline') {
    return (
      <div
        className={styles.expressionCodeEditor}
        style={{
          border: '1px solid rgba(0,0,0, 0.2)',
          ...(props.containerStyle || {}),
          height: '100px',
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
        {props.value?.value || 'Edit Expression'}
      </Button>
      <Modal
        destroyOnClose
        open={open}
        title="Expression Editor"
        onCancel={() => setOpen(false)}
        width="calc(100vw - 100px)"
        onOk={() => {
          onInnerValueChange();
          setOpen(false);
        }}
        style={{
          maxWidth: '800px',
        }}
        styles={{
          body: {
            height: '300px',
          },
        }}
      >
        <div style={{ height: '100%' }}>{open && editorView}</div>
      </Modal>
    </ConfigProvider>
  );
};

ExpressionSetter.setterName = '表达式';
