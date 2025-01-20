import { CustomSchemaFormInstance } from '@/component/CustomSchemaForm';
import { DEV_CONFIG_KEY, TLogicRunCodeItem } from '@chamn/model';
import { Handle, NodeProps, Position, Node } from '@xyflow/react';
import { useEffect, useRef, useState } from 'react';

import { ensureKeyExist } from '@/utils';
import { FunctionSetter } from '../../../FunctionSetter';
import { NodeCard } from '../../component/NodeCard';

export type TRunCodeNode = Node<TLogicRunCodeItem, 'RunCodeNode'>;

export const RunCodeNode = ({ data, isConnectable, selected, ...restProps }: NodeProps<TRunCodeNode>) => {
  ensureKeyExist(data, DEV_CONFIG_KEY, {});
  const devConfigObj = data[DEV_CONFIG_KEY]!;
  const formRef = useRef<CustomSchemaFormInstance>(null);
  const [formValue, setFormValue] = useState<TLogicRunCodeItem>();
  useEffect(() => {
    const newVal = {
      id: data.id,
      type: data.type,
      value: data.value,
      sourceCode: data.sourceCode,
    };
    formRef.current?.setFields(newVal);
    setFormValue(newVal);
  }, []);

  return (
    <div
      style={{
        minHeight: '80px',
        minWidth: '100px',
      }}
    >
      <NodeCard title="Run Code">
        <FunctionSetter
          mode="EMBED"
          initialValue={data.value}
          containerStyle={{
            width: '600px',
            height: '400px',
          }}
          onValueChange={(newVal: any) => {
            data.value = newVal;
          }}
        />
      </NodeCard>

      <Handle
        type="target"
        position={Position.Top}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <Handle type="source" position={Position.Bottom} id="a" isConnectable={isConnectable} />
    </div>
  );
};
