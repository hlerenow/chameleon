import { AssignValueNode } from './AssignValueNode';
import { BaseNode } from './BaseNode';
import { CallNodeMethodNode } from './CallNodeMethodNode';
import { JumpLinkNode } from './JumpLinkNode';
import { RequestAPINode } from './RequestAPINode';
import { RunCodeNode } from './RunCodeNode';

export const NODE_TYPE = {
  BaseNode: BaseNode,
  JumpLinkNode: JumpLinkNode,
  AssignValueNode: AssignValueNode,
  CallNodeMethodNode: CallNodeMethodNode,
  RunCodeNode: RunCodeNode,
  RequestAPINode: RequestAPINode,
};
