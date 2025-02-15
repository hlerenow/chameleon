import { Button } from 'antd';
import { useMemo, useState } from 'react';
import { CPage } from '@chamn/model';
import { SelectNodeModal } from './modal';

export const SelectNodeByTree = (props: {
  pageModel: CPage;
  onChange?: (data: { nodeId: string; title: string }) => void;
  value?: any;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [innerValue, setInnerValue] = useState<{ nodeId: string }>(props.value);

  const nodeTitle = useMemo(() => {
    const nodeInfo = props.pageModel.getNode(innerValue?.nodeId);
    if (nodeInfo) {
      return nodeInfo.value.title || nodeInfo.material?.value.title || '';
    }
    return '';
  }, [props.pageModel, innerValue?.nodeId]);

  return (
    <>
      <Button
        style={{
          width: '200px',
        }}
        onClick={() => setModalOpen(true)}
      >
        {nodeTitle ?? '选择节点'}
      </Button>
      <SelectNodeModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={(data) => {
          props.onChange?.(data);
          setInnerValue(data);
          setModalOpen(false);
        }}
        pageModel={props.pageModel}
        value={innerValue?.nodeId}
      />
    </>
  );
};
