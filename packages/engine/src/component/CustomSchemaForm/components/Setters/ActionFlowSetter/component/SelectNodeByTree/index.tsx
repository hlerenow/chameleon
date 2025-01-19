import { transformPageSchemaToTreeData, traverseTree } from '@/plugins/OutlineTree/util';
import { Input, Popover, Tree } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import { generateKeyList, getParentKey } from './util';
import { CPage } from '@chamn/model';

export const SelectNodeByTree = (props: {
  pageModel: CPage;
  onChange?: (data: { nodeId: string; title: string }) => void;
}) => {
  const boxDomRef = useRef<HTMLDivElement>(null);

  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchValue, setSearchValue] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<{ title: string; key: string }>({ title: '', key: '' });
  const [nodePopupOpen, setNodePopupOpen] = useState(false);

  const [autoExpandParent, setAutoExpandParent] = useState(true);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const isContain = boxDomRef.current?.contains(e.target as any);
      if (!isContain) {
        setNodePopupOpen(false);
      }
    };
    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, []);

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

  const nodeKeyList = useMemo(() => {
    return generateKeyList(treeData as any);
  }, [treeData]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: newValue } = e.target;
    const newExpandedKeys = nodeKeyList
      .map((item) => {
        if (item.title.toLowerCase().indexOf(String(newValue).toLowerCase()) > -1) {
          return getParentKey(item.key, treeData as any);
        }
        return null;
      })
      .filter((item, i, self): item is React.Key => !!(item && self.indexOf(item) === i));

    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(true);
    setSearchValue(newValue);
  };

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };

  useEffect(() => {
    setExpandedKeys(nodeKeyList.map((el) => el.key));
  }, []);

  return (
    <div ref={boxDomRef} style={{ width: 250 }}>
      <Popover
        open={nodePopupOpen}
        placement="bottomLeft"
        getPopupContainer={() => boxDomRef?.current || document.body}
        content={
          <div
            style={{
              width: '350px',
            }}
          >
            <Tree
              treeData={treeData}
              defaultExpandAll
              onExpand={onExpand}
              expandedKeys={expandedKeys}
              autoExpandParent={autoExpandParent}
              onSelect={(selectKeys, { node }: any) => {
                setSearchValue(node.sourceData.title);
                setCurrentValue(node.sourceData);
                props.onChange?.({
                  nodeId: node.key,
                  title: node.sourceData.title,
                });
              }}
            />
          </div>
        }
      >
        <Input
          value={searchValue}
          placeholder="Select Node"
          onChange={onChange}
          onBlur={() => {
            setSearchValue(currentValue.title);
          }}
          onFocus={() => {
            setNodePopupOpen(true);
          }}
        />
      </Popover>
    </div>
  );
};
