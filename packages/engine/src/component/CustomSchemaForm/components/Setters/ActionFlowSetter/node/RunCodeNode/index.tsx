import { DEV_CONFIG_KEY, TLogicRunCodeItem } from '@chamn/model';
import { NodeProps, Node } from '@xyflow/react';

import { ensureKeyExist } from '@/utils';
import { FunctionSetter } from '../../../FunctionSetter';
import { NodeCard } from '../../component/NodeCard';
import { useActionFlow } from '../../context';

export type TRunCodeNode = Node<TLogicRunCodeItem, 'RunCodeNode'>;

export const RunCodeNode = (props: NodeProps<TRunCodeNode>) => {
  const { data } = props;
  ensureKeyExist(data, DEV_CONFIG_KEY, {});

  const { onDataChange, pluginCtx, nodeModel } = useActionFlow();

  return (
    <div
      style={{
        minHeight: '80px',
        minWidth: '100px',
      }}
    >
      <NodeCard title="Run Code" nodeProps={props}>
        <FunctionSetter
          mode="inline"
          initialValue={data.value}
          containerStyle={{
            paddingTop: '10px',
            width: '600px',
            height: '300px',
          }}
          onValueChange={(newVal: any) => {
            data.value = newVal.value;
            onDataChange();
          }}
          setterContext={{
            pluginCtx: pluginCtx,
            setCollapseHeaderExt: undefined,
            onSetterChange: function () {},
            keyPaths: [],
            label: '',
            nodeModel: nodeModel as any,
          }}
        />
      </NodeCard>
    </div>
  );
};
