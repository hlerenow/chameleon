import { NodeProps, Node } from '@xyflow/react';
import { NodeCard } from '../component/NodeCard';

export type CounterNode = Node<any, 'StartNode'>;

export const StartNode = (props: NodeProps<CounterNode>) => {
  return (
    <NodeCard nodeProps={props} useCardStyle={false} inputHandle={false}>
      <div
        style={{
          minWidth: '100px',
          padding: '10px 20px',
          border: '1px solid #1a192b',
          borderRadius: '4px',
          textAlign: 'center',
        }}
      >
        Start
      </div>
    </NodeCard>
  );
};
