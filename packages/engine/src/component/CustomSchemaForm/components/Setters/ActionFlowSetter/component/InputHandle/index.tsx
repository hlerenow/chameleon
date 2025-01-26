import { Handle, HandleProps, Position } from '@xyflow/react';
import { INPUT_HANDLE_ID } from '../../config';

export const InputHandle = (props: Partial<HandleProps>) => {
  return <Handle type="target" id={INPUT_HANDLE_ID} position={Position.Top} {...props} />;
};
