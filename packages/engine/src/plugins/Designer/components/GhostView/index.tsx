import React from 'react';
import { CNode, CSchema } from '@chameleon/model';

export const GhostView = ({ node }: { node: CNode | CSchema }) => {
  return (
    <div
      style={{
        backgroundColor: 'rgba(100,100,100)',
        padding: '3px 10px',
        borderRadius: '2px',
        opacity: 0.9,
      }}
    >
      {node.value.componentName}
    </div>
  );
};
