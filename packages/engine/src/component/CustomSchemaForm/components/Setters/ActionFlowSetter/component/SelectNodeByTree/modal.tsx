import { Modal, TreeSelect } from 'antd';
import { CPage } from '@chamn/model';
import { useRef, useMemo } from 'react';
import { transformPageSchemaToTreeData, traverseTree } from '@/plugins/OutlineTree/util';
import { getNodeInfo } from '../SelectNodeByTree/util';

interface SelectNodeModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (data: { nodeId: string; title: string }) => void;
  pageModel: CPage;
  value?: string;
}

export const SelectNodeModal = (props: SelectNodeModalProps) => {
  const { open, onCancel, onOk, pageModel, value } = props;
  const boxDomRef = useRef<HTMLDivElement>(null);

  const treeData = useMemo(() => {
    if (!pageModel) return;
    const treeData = transformPageSchemaToTreeData(pageModel?.export(), pageModel);
    traverseTree(treeData, (el: any) => {
      el.sourceData = {
        title: el.title,
        value: el.value,
      };
      el.value = el.key;
      el.title = <div style={{ flexWrap: 'nowrap', display: 'flex', width: '150px' }}>{el.title}</div>;

      return false;
    });
    return treeData;
  }, [pageModel]);

  return (
    <Modal open={open} onCancel={onCancel} title="选择节点" onOk={() => onOk({ nodeId: value || '', title: '' })}>
      <div ref={boxDomRef} style={{ width: '100%' }}>
        <TreeSelect
          virtual={false}
          showSearch
          style={{ width: '100%' }}
          value={value}
          allowClear
          onClear={() => {
            onOk({
              nodeId: '',
              title: '',
            });
          }}
          filterTreeNode={(inputValue, treeNode: any) => {
            return treeNode.sourceData?.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
          }}
          getPopupContainer={() => boxDomRef.current!}
          treeDefaultExpandAll
          onChange={(newVal) => {
            const nodeInfo = getNodeInfo(newVal, (treeData as any) ?? []);
            onOk({
              nodeId: newVal,
              title: (nodeInfo as any)?.sourceData?.title,
            });
          }}
          treeData={treeData}
        />
      </div>
    </Modal>
  );
};
