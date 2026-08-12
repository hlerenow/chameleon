import React, { useState } from 'react';
import { CopyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, message, Modal } from 'antd';
import { CNode } from '@chamn/model';
import { MonacoEditor } from '../../../../component/MonacoEditor';
import styles from '../DefaultSelectToolBar/style.module.scss';

export const NodeSchemaButton = ({ node }: { node?: CNode }) => {
  const [open, setOpen] = useState(false);

  if (!node) {
    return null;
  }

  const schema = JSON.stringify(node.export('save'), null, 2);
  const copySchema = async () => {
    try {
      await navigator.clipboard.writeText(schema);
      message.success('Schema copied');
    } catch {
      message.error('Failed to copy schema');
    }
  };

  return (
    <>
      <div className={styles.item} onClick={() => setOpen(true)} title="View node schema">
        <InfoCircleOutlined />
      </div>
      <Modal
        open={open}
        title={`${node.value.title || node.material?.value.title || node.value.componentName || 'Node'} Schema`}
        width="100%"
        onCancel={() => setOpen(false)}
        footer={
          <Button icon={<CopyOutlined />} onClick={copySchema}>
            Copy
          </Button>
        }
        style={{ height: 'calc(100vh - 50px)', top: '25px' }}
        destroyOnHidden
      >
        <div style={{ width: '100%', height: 'calc(100vh - 200px)' }}>
          <MonacoEditor initialValue={schema} language="json" options={{ automaticLayout: true, readOnly: true }} />
        </div>
      </Modal>
    </>
  );
};
