import {
  AssignValueType,
  getRandomStr,
  LogicType,
  TLogicAssignValueItem,
  TLogicCallNodeMethodItem,
  TLogicJumpLinkItem,
  TLogicRequestAPIItem,
  TLogicRunCodeItem,
} from '@chamn/model';

export const DEFAULT_NODE_LIST = [
  {
    key: LogicType.ASSIGN_VALUE,
    name: '赋值/创建变量',
    getInitData: () => {
      const id = getRandomStr();
      const assignValueItem: TLogicAssignValueItem = {
        id: id,
        type: LogicType.ASSIGN_VALUE,
        valueType: AssignValueType.STATE,
        currentValue: '',
        targetValueName: '',
      };

      return assignValueItem;
    },
  },
  {
    key: LogicType.JUMP_LINK,
    name: '页面跳转',
    getInitData: () => {
      const id = getRandomStr();
      const assignValueItem: TLogicJumpLinkItem = {
        id: id,
        type: LogicType.JUMP_LINK,
        link: '',
      };

      return assignValueItem;
    },
  },
  {
    key: LogicType.REQUEST_API,
    name: '请求数据',
    getInitData: () => {
      const id = getRandomStr();
      const requestAPIItem: TLogicRequestAPIItem = {
        id: id,
        type: LogicType.REQUEST_API,
        apiPath: '',
        method: 'GET',
        header: {},
        query: {},
        responseVarName: `responseData_${id}`,
        afterSuccessResponse: [],
        afterFailedResponse: [
          {
            id: getRandomStr(),
            type: LogicType.RUN_CODE,
            value: 'console.error("API request failed:", $$response)',
          },
        ],
      };

      return requestAPIItem;
    },
  },
  {
    key: LogicType.CALL_NODE_METHOD,
    name: '调用组件方法',
    getInitData: () => {
      const id = getRandomStr();

      const callNodeMethodItem: TLogicCallNodeMethodItem = {
        id: id,
        type: LogicType.CALL_NODE_METHOD,
        nodeId: '',
        methodName: '',
        args: [],
        returnVarName: '',
      };

      return callNodeMethodItem;
    },
  },
  {
    key: LogicType.RUN_CODE,
    name: '运行代码',
    getInitData: () => {
      const id = getRandomStr();

      const runCodeItem: TLogicRunCodeItem = {
        id: id,
        type: LogicType.RUN_CODE,
        name: `run_code_${id}`,
        value: `console.log('hello world');`,
      };

      return runCodeItem;
    },
  },
];
