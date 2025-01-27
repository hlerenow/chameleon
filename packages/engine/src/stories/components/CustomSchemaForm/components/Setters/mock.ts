import { REACT_FLOW_DRAG_CLASS_NAME } from '@/component/CustomSchemaForm/components/Setters/ActionFlowSetter/config';
import { NODE_TYPE } from '@/component/CustomSchemaForm/components/Setters/ActionFlowSetter/node';
import {
  LogicType,
  DEV_CONFIG_KEY,
  AssignValueType,
  TLogicAssignValueItem,
  TLogicJumpLinkItem,
  TLogicItemHandlerFlow,
  getRandomStr,
} from '@chamn/model';

export const mockNodeList = [
  {
    data: {},
    position: { x: 0, y: 0 },
    type: NODE_TYPE.START_NODE,
    dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
    selectable: false,
  },
  {
    type: NODE_TYPE.RUN_CODE,
    data: {
      value: 'console.log(123)',
    },
    dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
    position: { x: 0, y: 0 },
  },
  {
    type: LogicType.REQUEST_API,
    data: {
      value: 'console.log(123)',
    },
    dragHandle: `.${REACT_FLOW_DRAG_CLASS_NAME}`,
    position: { x: 0, y: 0 },
  },

  {
    type: LogicType.ASSIGN_VALUE,
    data: {
      ...{
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

export const logicListSchema: TLogicItemHandlerFlow = [
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
  {
    id: getRandomStr(),
    type: LogicType.REQUEST_API,
    apiPath: '',
    method: 'GET',
    header: {},
    query: {},
    responseVarName: `responseData_${getRandomStr()}`,
    afterSuccessResponse: [
      {
        type: 'ASSIGN_VALUE',
        valueType: 'MEMORY',
        currentValue: {
          type: 'FUNCTION',
          value: 'console.log(12444)',
        },
        targetValueName: 'Asd',
      } as TLogicAssignValueItem,
    ],
    afterFailedResponse: [
      {
        id: getRandomStr(),
        type: LogicType.RUN_CODE,
        value: 'console.error("API request failed:", $$response)',
      },
    ],
  },
];
