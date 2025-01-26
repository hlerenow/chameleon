import { Handle, HandleProps, Position } from '@xyflow/react';
import { OUTPUT_HANDLE_ID } from '../../config';

export const OutputHandle = (props: Partial<HandleProps>) => {
  return <Handle type="source" position={Position.Bottom} id={OUTPUT_HANDLE_ID} {...props} />;
};
