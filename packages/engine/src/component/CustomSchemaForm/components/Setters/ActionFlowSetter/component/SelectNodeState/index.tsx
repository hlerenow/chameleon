import { CPage } from '@chamn/model';
import { SelectNodeByTree } from '../SelectNodeByTree';
import { Input, Space } from 'antd';

export const SelectNodeState = (props: {
  value?: {
    nodeId: string;
    keyPath: string;
  };
  pageModel: CPage;
  onChange?: (data: { nodeId: string; keyPath: string }) => void;
}) => {
  return (
    <div>
      <Space>
        <SelectNodeByTree
          pageModel={props.pageModel}
          onChange={(data) => {
            props.onChange?.({
              nodeId: data.nodeId,
              keyPath: props.value?.keyPath || '',
            });
          }}
        />
        <Input
          style={{
            width: 250,
          }}
          value={props.value?.keyPath}
          onChange={(e) => {
            const { value: inputValue } = e.target;
            props.onChange?.({
              nodeId: props.value?.nodeId || '',
              keyPath: String(inputValue),
            });
          }}
          placeholder="variable name. support '.'"
        />
      </Space>
    </div>
  );
};
