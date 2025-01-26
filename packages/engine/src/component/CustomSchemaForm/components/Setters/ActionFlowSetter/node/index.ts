import { LogicType } from '@chamn/model';
import { AssignValueNode } from './AssignValueNode';
import { StartNode } from './BaseNode';
import { CallNodeMethodNode } from './CallNodeMethodNode';
import { JumpLinkNode } from './JumpLinkNode';
import { RequestAPINode } from './RequestAPINode';
import { RunCodeNode } from './RunCodeNode';

export enum NODE_TYPE {
  START_NODE = 'START_NODE',
  JUMP_LINK = LogicType.JUMP_LINK,
  ASSIGN_VALUE = LogicType.ASSIGN_VALUE,
  CALL_NODE_METHOD = LogicType.CALL_NODE_METHOD,
  RUN_CODE = LogicType.RUN_CODE,
  REQUEST_API = LogicType.REQUEST_API,
}

export const NODE_MAP = {
  [NODE_TYPE.START_NODE]: StartNode,
  [NODE_TYPE.JUMP_LINK]: JumpLinkNode,
  [NODE_TYPE.ASSIGN_VALUE]: AssignValueNode,
  [NODE_TYPE.CALL_NODE_METHOD]: CallNodeMethodNode,
  [NODE_TYPE.RUN_CODE]: RunCodeNode,
  [NODE_TYPE.REQUEST_API]: RequestAPINode,
};
