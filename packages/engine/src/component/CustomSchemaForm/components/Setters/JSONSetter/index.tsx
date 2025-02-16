import React, { useEffect, useRef, useState } from 'react';
import { Button, ConfigProvider } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { EditorType, MonacoEditor, MonacoEditorInstance } from '../../../../MonacoEditor';
import { MoveableModal } from '@/component/MoveableModal';
import { sageJSONParse } from '@/utils';

const EditorConfig = {
  options: {
    automaticLayout: true,
    tabSize: 2,
    suggestOnTriggerCharacters: false,
    minimap: { enabled: false },
  },
  style: {
    height: '200px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
  },
};

const JsonEditor = ({ editor, value, initialValue, onChange, height, editorOptions }: any) => {
  const editorRef = useRef<MonacoEditorInstance>();
  const oldValueRef = useRef();
  oldValueRef.current = value;
  useEffect(() => {
    const oldVal = sageJSONParse(editorRef.current?.getValue() || '', {});
    if (JSON.stringify(value) === JSON.stringify(oldVal)) {
      return;
    }
    editorRef.current?.setValue(JSON.stringify(value, null, 2));
  }, [value]);
  return (
    <div style={{ height: height || EditorConfig.style.height }}>
      <MonacoEditor
        onDidMount={(editorInstance) => {
          editor.current = editorInstance;
          editorRef.current = editorInstance;
        }}
        onChange={onChange}
        initialValue={JSON.stringify(value ?? (initialValue || {}), null, 2)}
        language="json"
        options={{
          ...EditorConfig.options,
          ...editorOptions,
        }}
      />
    </div>
  );
};
export const JSONSetter: CSetter<any> = ({
  onValueChange,
  initialValue,
  mode = 'modal',
  editorOptions,
  setterContext,
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
    try {
      const newVal = JSON.parse(newValStr);
      onValueChange?.(newVal);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <ConfigProvider theme={{ token: { borderRadius: 4 } }}>
      {mode === 'inline' ? (
        <div style={EditorConfig.style}>
          <JsonEditor
            editor={editorRef}
            value={props.value}
            initialValue={initialValue}
            onChange={onInnerValueChange}
            editorOptions={editorOptions || {}}
          />
        </div>
      ) : (
        <>
          <Button
            size="small"
            style={{
              marginTop: '5px',
              width: '100%',
              color: '#676767',
              fontSize: '12px',
            }}
            onClick={() => setOpen(true)}
          >
            Edit
          </Button>
          <MoveableModal
            destroyOnClose
            open={open}
            title="JSON Editor"
            width="800px"
            onCancel={() => setOpen(false)}
            onOk={() => {
              onInnerValueChange();
              setOpen(false);
            }}
          >
            {open && (
              <JsonEditor
                editor={editorRef}
                value={props.value}
                initialValue={initialValue}
                height="500px"
                editorOptions={editorOptions || {}}
              />
            )}
          </MoveableModal>
        </>
      )}
    </ConfigProvider>
  );
};

JSONSetter.setterName = 'JSON 设置器';
