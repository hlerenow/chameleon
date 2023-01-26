import React, { useState } from 'react';
import { Modal } from 'antd';
import { MonacoEditor } from '../../component/MonacoEditor';
import { CPage } from '@chameleon/model';

export type DisplaySourceSchemaProps = {
  pageModel: CPage;
  children: React.ReactNode;
};

export const DisplaySourceSchema = (props: DisplaySourceSchemaProps) => {
  const initialValue = props.pageModel.export();
  const [open, setOpen] = useState(false);
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
        onOk={() => setOpen(false)}
        style={{
          height: 'calc(100vh - 50px)',
          top: '25px',
        }}
      >
        <div style={{ width: '100%', height: 'calc(100vh - 200px)' }}>
          {open && (
            <MonacoEditor
              initialValue={JSON.stringify(initialValue, null, 2)}
              language={'json'}
              options={{
                automaticLayout: true,
                readOnly: true,
              }}
            />
          )}
        </div>
      </Modal>
    </>
  );
};
