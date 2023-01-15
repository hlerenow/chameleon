import React from 'react';
import { CNode, CSchema } from '@chameleon/model';

export const GhostView = ({ node }: { node: CNode | CSchema }) => {
  console.log(
    '🚀 ~ file: index.tsx:5 ~ GhostView ~ node',
    node.value.componentName,
    node
  );

  return (
    <div
      style={{
        backgroundColor: 'rgba(100,100,100)',
        padding: '3px 10px 3px 15px',
        borderRadius: '2px',
        opacity: 0.9,
        color: 'rgba(220,220,220)',
      }}
    >
      {node.value.componentName}
    </div>
  );
};
