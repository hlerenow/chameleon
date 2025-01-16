import { transformPageSchemaToTreeData, traverseTree } from '@/plugins/OutlineTree/util';
import { TreeSelect } from 'antd';
import { useMemo, useRef, useState } from 'react';

export const SelectNodeState = (props: { pageModel: any }) => {
  const treeData = useMemo(() => {
    if (!props.pageModel) {
      return;
    }
    const treeData = transformPageSchemaToTreeData(props.pageModel?.export(), props.pageModel);
    traverseTree(treeData, (el: any) => {
      el.value = el.key;
      return false;
    });
    return treeData;
  }, [props.pageModel]);

  console.log('🚀 ~ treeData ~ treeData:', treeData);
  const treeRef = useRef<any>();
  console.log('🚀 ~ SelectNodeState ~ treeRef:', treeRef);
  const [value, setValue] = useState<string>('');
  const onChange = (newValue: string) => {
    setValue(newValue);
  };
  return (
    <div id="tse">
      <TreeSelect
        ref={treeRef}
        showSearch
        style={{ width: '100%' }}
        // value={value}
        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
        placeholder="Please select"
        allowClear
        treeDefaultExpandAll
        onChange={onChange}
        treeData={treeData}
        getPopupContainer={() => document.getElementById('tse')!}
        // onPopupScroll={onPopupScroll}
      />
    </div>
  );
};
