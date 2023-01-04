import React from 'react';
import { CNode, CSchema } from '@chameleon/model';

export const GhostView = ({ node }: { node: CNode | CSchema }) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(0,0,0,0.3)',
        padding: '5px 10px',
      }}
    >
      {node.value.componentName}
    </div>
  );
};
