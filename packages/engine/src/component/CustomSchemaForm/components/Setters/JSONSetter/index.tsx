import React, { useRef, useState } from 'react';
import { Button, ConfigProvider, Modal } from 'antd';
import { CSetter, CSetterProps } from '../type';
import { MonacoEditor, MonacoEditorInstance } from '../../../../MonacoEditor';

export const JSONSetter: CSetter<any> = ({
  onValueChange,
  setterContext,
  initialValue,
  ...props
}: CSetterProps<any>) => {
  const { keyPaths, onSetterChange } = setterContext;

  const editorRef = useRef<MonacoEditorInstance | null>(null);

  const [open, setOpen] = useState(false);
  const onInnerValueChange = () => {
    const newValStr = editorRef.current?.getValue() || '';
    try {
      const newVal = JSON.parse(newValStr);
      onValueChange(newVal);
    } catch (e) {
      console.warn(e);
    }
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
        title="JSON Editor"
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
              onDidMount={(editor) => {
                editorRef.current = editor;
              }}
              initialValue={JSON.stringify(props.value ?? (initialValue || {}), null, 2)}
              language={'json'}
              options={{
                automaticLayout: true,
                tabSize: 2,
                suggestOnTriggerCharacters: false,
              }}
            />
          )}
        </div>
      </Modal>
    </ConfigProvider>
  );
};

JSONSetter.setterName = 'JSON 设置器';
