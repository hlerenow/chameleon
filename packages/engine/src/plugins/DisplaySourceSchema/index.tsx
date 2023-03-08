import React, { useRef, useState } from 'react';
import { Modal } from 'antd';
import {
  MonacoEditor,
  MonacoEditorInstance,
} from '../../component/MonacoEditor';
import { CNode, CPage } from '@chameleon/model';
import { waitReactUpdate } from '../../utils';
import { EnginContext } from '../../Engine';
import { DesignerExports } from '../Designer';

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
          console.log(
            '🚀 ~ file: index.tsx:40 ~ DisplaySourceSchema ~ newPageJSON:',
            newPageJSON
          );
          props.pageModel.updatePage(newPageJSON);
          await waitReactUpdate();
          const workBench = engineCtx.engine.getWorkBench();
          const currentSelectNode = workBench?.currentSelectNode;
          const designer = engineCtx.pluginManager.get('Designer');
          const nodeId = currentSelectNode?.id || '';
          designer?.ctx.emitter.on('ready', () => {
            const designerExports: DesignerExports = designer.exports;
            designerExports.selectNode(nodeId);
          });
          if (designer) {
            const designerExports: DesignerExports = designer.exports;
            designerExports.selectNode(nodeId);
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
