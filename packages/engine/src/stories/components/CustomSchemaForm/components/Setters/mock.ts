import { REACT_FLOW_DRAG_CLASS_NAME } from '@/component/CustomSchemaForm/components/Setters/ActionFlowSetter/config';
import { NODE_TYPE } from '@/component/CustomSchemaForm/components/Setters/ActionFlowSetter/node';
import { LogicType, DEV_CONFIG_KEY, AssignValueType, TLogicAssignValueItem, TLogicJumpLinkItem } from '@chamn/model';

export const mockNodeList = [
  {
    id: '1',
    data: { id: '1' },
    position: { x: 0, y: 0 },
    type: NODE_TYPE.START_NODE,
    dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
    selectable: false,
  },
  {
    id: '999',
    type: 'RunCodeNode',
    data: {
      id: '13',
      value: 'console.log(123)',
    },
    dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
    position: { x: 0, y: 0 },
  },
  {
    id: '13',
    type: LogicType.REQUEST_API,
    data: {
      id: '13',
      value: 'console.log(123)',
    },
    dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
    position: { x: 0, y: 0 },
  },

  {
    id: '7',
    type: LogicType.ASSIGN_VALUE,
    data: {
      ...{
        id: '7',
        type: 'ASSIGN_VALUE',
        nodeId: 'globalStateText',
        methodName: 'doAlert',
        args: ['123', { type: 'EXPRESSION', value: 'q2123' }],
      },
      [DEV_CONFIG_KEY]: {
        defaultSetterMap: { 'args.1': { name: 'args.1', setter: 'ExpressionSetter' } },
      },
    },
    dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
    position: { x: 0, y: 0 },
  },
];

export const logicListSchema: any[] = [
  {
    type: 'JUMP_LINK',
    link: '------',
  },
  {
    type: 'JUMP_LINK',
    link: {
      type: 'EXPRESSION',
      value: '$$context.state.link',
    },
  } as TLogicJumpLinkItem,
  {
    type: 'JUMP_LINK',
    link: {
      type: 'FUNCTION',
      sourceCode: `function () {
      return $$context.state.link;
    }`,
      value: `function () {
    console.log('jump3');
      return $$context.state.link;
    }`,
    },
  } as TLogicJumpLinkItem,
  {
    type: 'ASSIGN_VALUE',
    valueType: AssignValueType.STATE,
    currentValue: 123,
    targetValueName: 'Asd',
  } as TLogicAssignValueItem,
  {
    type: 'ASSIGN_VALUE',
    valueType: AssignValueType.STATE,
    currentValue: {
      type: 'EXPRESSION',
      value: '$$context',
    },
    targetValueName: {
      keyPath: 'testName',
      nodeId: '12323',
    },
  } as TLogicAssignValueItem,
  {
    type: 'ASSIGN_VALUE',
    valueType: 'MEMORY',
    currentValue: {
      type: 'FUNCTION',
      value: 'console.log(12444)',
    },
    targetValueName: 'Asd',
  } as TLogicAssignValueItem,
];
