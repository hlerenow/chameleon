import React, { useRef, useState } from 'react';
import { Modal } from 'antd';
import { MonacoEditor, MonacoEditorInstance } from '../../component/MonacoEditor';
import { CPage } from '@chamn/model';
import { waitReactUpdate } from '../../utils';
import { EnginContext } from '../../index';
import { DesignerPluginInstance } from '../Designer';

export type DisplaySourceSchemaProps = {
  pageModel: CPage;
  engineCtx: EnginContext;
  children: React.ReactNode;
};

export const DisplaySourceSchema = (props: DisplaySourceSchemaProps) => {
  const initialValue = props.pageModel.export();
  const { engineCtx } = props;
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
        onOk={async () => {
          setOpen(false);
          const newPage = editorRef.current?.getValue();
          if (!newPage) {
            return;
          }
          const newPageJSON = JSON.parse(newPage);
          props.pageModel.updatePage(newPageJSON);
          await waitReactUpdate();
          const currentSelectNode = engineCtx.engine.getActiveNode();
          const designerPluginInstance = await engineCtx.pluginManager.get<DesignerPluginInstance>('Designer');
          const nodeId = currentSelectNode?.id || '';
          designerPluginInstance?.ctx.emitter.on('ready', () => {
            const designerExport = designerPluginInstance.export;
            designerExport.selectNode(nodeId);
          });
          if (designerPluginInstance) {
            const designerExport = designerPluginInstance.export;
            designerExport.selectNode(nodeId);
          }
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
