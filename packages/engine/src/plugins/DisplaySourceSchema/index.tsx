import React, { useRef, useState } from 'react';
import { Modal } from 'antd';
import {
  MonacoEditor,
  MonacoEditorInstance,
} from '../../component/MonacoEditor';
import { CPage } from '@chameleon/model';
import { PluginInstance } from '../../core/pluginManager';
import { DesignerExports } from '../Designer';

export type DisplaySourceSchemaProps = {
  pageModel: CPage;
  children: React.ReactNode;
};

export const DisplaySourceSchema = (props: DisplaySourceSchemaProps) => {
  const initialValue = props.pageModel.export();

  const [open, setOpen] = useState(false);
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  return (
    <>
      <div
        onClick={() => {
          setOpen(true);
        }}
      >
        {props.children}
      </div>
      <Modal
        open={open}
        title="Source Schema"
        width={'100%'}
        onCancel={() => setOpen(false)}
        onOk={() => {
          setOpen(false);
          const newPage = editorRef.current?.getValue();
          if (!newPage) {
            return;
          }
          const newPageJSON = JSON.parse(newPage);
          props.pageModel.updatePage(newPageJSON);
        }}
        style={{
          height: 'calc(100vh - 50px)',
          top: '25px',
        }}
        destroyOnClose
      >
        <div style={{ width: '100%', height: 'calc(100vh - 200px)' }}>
          <MonacoEditor
            initialValue={JSON.stringify(initialValue, null, 2)}
            language={'json'}
            options={{
              automaticLayout: true,
            }}
            onDidMount={(editor) => {
              editorRef.current = editor;
            }}
          />
        </div>
      </Modal>
    </>
  );
};
