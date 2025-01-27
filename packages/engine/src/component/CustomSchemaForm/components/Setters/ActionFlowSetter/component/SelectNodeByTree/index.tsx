import { transformPageSchemaToTreeData, traverseTree } from '@/plugins/OutlineTree/util';
import { TreeSelect } from 'antd';
import { useMemo, useRef } from 'react';
import { CPage } from '@chamn/model';
import { getNodeInfo } from './util';

export const SelectNodeByTree = (props: {
  pageModel: CPage;
  onChange?: (data: { nodeId: string; title: string }) => void;
  value?: any;
}) => {
  const boxDomRef = useRef<HTMLDivElement>(null);

  const treeData = useMemo(() => {
    if (!props.pageModel) {
      return;
    }
    const treeData = transformPageSchemaToTreeData(props.pageModel?.export(), props.pageModel);
    traverseTree(treeData, (el: any) => {
      el.value = el.key;
      el.sourceData = el;
      return false;
    });

    return treeData;
  }, [props.pageModel]);

  return (
    <div ref={boxDomRef} style={{ width: 250 }}>
      <TreeSelect
        showSearch
        style={{ width: '100%' }}
        value={props.value}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        allowClear
        onClear={() => {
          props.onChange?.({
            nodeId: '',
            title: '',
          });
        }}
        filterTreeNode={(inputValue, treeNode: any) => {
          return treeNode.title.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
        }}
        getPopupContainer={() => boxDomRef.current!}
        treeDefaultExpandAll
        onChange={(newVal) => {
          const nodeInfo = getNodeInfo(newVal, (treeData as any) ?? []);
          props.onChange?.({
            nodeId: newVal,
            title: (nodeInfo as any)?.sourceData?.title,
          });
        }}
        treeData={treeData}
      />
    </div>
  );
};
