import {
  CNodePropsTypeEnum,
  CPageDataType,
  LogicType,
  TLogicAssignValueItem,
  TLogicJumpLinkItem,
} from '@chamn/model';

export const SamplePage: CPageDataType = {
  version: '1.0.0',
  name: 'BaseDemoPage',
  componentsMeta: [],
  componentsTree: {
    id: '1',
    componentName: 'RootContainer',
    props: {
      a: 1,
    },
    children: [
      {
        id: 'globalStateText',
        componentName: 'div',
        injectEnvList: ['COMPONENTS'],
        props: {
          children: {
            type: 'EXPRESSION',
            value:
              '"rowState to reshow: " + $$context.stateManager.RowState.state.rowMark',
          },
        },
      },
      {
        componentName: 'Card',
        state: {
          link: 'https://www.baidu2.com/state',
        },
        props: {
          onClick1: {
            type: 'FUNCTION',
            value: `
              function (a) {
                console.log(a, $$context);
                const stateManager = $$context.stateManager;
                const methods = $$context.getMethods();
                console.log("🚀 ~ methods:", methods)
                const state = stateManager.RowState.state;
                stateManager.RowState.updateState({
                  rowMark: state.rowMark  +1
                })
              }
            `,
          },
          onClick: {
            type: CNodePropsTypeEnum.ACTION,
            handler: [
              {
                id: 1,
                type: 'RUN_CODE',
                sourceCode: '',
                value: `
                    console.log('12321312');
                    return 555;
                  `,
                next: 2,
              },
              {
                id: 2,
                next: 3,
                type: 'JUMP_LINK',
                link: 'https://www.baidu.com',
              },
              {
                type: 'JUMP_LINK',
                link: {
                  type: 'EXPRESSION',
                  value: '$$context.state.link',
                },
              } as TLogicJumpLinkItem,
              {
                id: '3',
                next: '4',
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
                id: 4,
                type: LogicType.REQUEST_API,
                apiPath: {
                  type: 'FUNCTION',
                  value: `
                    function () {
                      console.log($$context);
                      return 'https://www.api.com'
                    }
                  `,
                },
                body: {
                  a: '123',
                  f: 456,
                  b: {
                    type: 'EXPRESSION',
                    value: '$$context.state.link',
                  },
                  c: {
                    type: 'FUNCTION',
                    sourceCode: `function () {
                    return $$context.state.link;
                  }`,
                    value: `function () {
                    return $$context.state.link;
                  }`,
                  },
                },
                responseVarName: 'APIResult',
                afterSuccessResponse: [
                  {
                    id: 't1',
                    next: 't2',
                    type: 'RUN_CODE',
                    value: `
                      console.log($$context, $$response);
                      console.log(77889999, apiResult)
                  `,
                  },
                  {
                    id: 't2',
                    next: 't3',
                    type: 'CALL_NODE_METHOD',
                    nodeId: 'testNode',
                    methodName: 'sayHello',
                    args: [
                      123,
                      {
                        type: 'EXPRESSION',
                        value: '$$context.state.a',
                      },
                      {
                        type: 'FUNCTION',
                        value: `
                        function (apiResult) {
                          console.log('apiResult 99999', apiResult, $$response);
                          return 890;
                        }
                      `,
                      },
                    ],
                    returnVarName: 'callNodeReturnVar',
                  },
                  {
                    type: 'RUN_CODE',
                    id: 't3',
                    next: 't4',
                    value: `
                      console.log(9898989, apiResult, $$context, $$response, $$actionVariableSpace);
                      console.log(77889999,callNodeReturnVar, APIResult)
                  `,
                  },
                  {
                    id: 't4',
                    next: 't5',
                    type: LogicType.ASSIGN_VALUE,
                    valueType: 'STATE',
                    currentValue: {
                      type: 'EXPRESSION',
                      value: 'APIResult',
                    },
                    targetValueName: {
                      nodeId: 'xxx',
                      keyPath: 'apiResult',
                    },
                  } as TLogicAssignValueItem,
                  {
                    id: 't5',
                    next: 't6',
                    type: LogicType.ASSIGN_VALUE,
                    valueType: 'MEMORY',
                    currentValue: {
                      type: 'FUNCTION',
                      value: `function (apiResult) {
                        console.log(6677, apiResult, APIResult);
                        return apiResult;
                      }
                      `,
                    },
                    targetValueName: 'tempApiResult1',
                  } as TLogicAssignValueItem,
                ],
                afterFailedResponse: [
                  {
                    type: 'RUN_CODE',
                    id: 't7',
                    next: 't8',
                    value: `
                      console.log($$context, $$response);
                      console.log('errrrror', apiResult)
                  `,
                  },
                ],
              },
            ],
          },
        },
        eventListener: [
          {
            name: 'ON_DID_RENDER',
            func: {
              type: CNodePropsTypeEnum.ACTION,
              handler: [
                {
                  id: '12',
                  type: 'RUN_CODE',
                  value: `
                    console.log('12321312', $$context, params);
                    console.log('Component Did Mount')
                    return 'Component Did Mount'
                `,
                },
              ],
            },
          },
          {
            name: 'ON_WILL_DESTROY',
            func: {
              type: CNodePropsTypeEnum.ACTION,
              handler: [
                {
                  id: '123',
                  type: 'RUN_CODE',
                  value: `
                    console.log('12321312', $$context, params);
                    console.log('Component ON_WILL_DESTROY')
                    return 'Component ON_WILL_DESTROY'
                `,
                },
              ],
            },
          },
        ],
        methods: [
          {
            name: 'getAge',
            type: 'FUNCTION',
            value: `function getAge() {
            console.log(12);
            }`,
          },
        ],
        children: ['Action login flow Demo'],
      },
      {
        id: 'testNode',
        componentName: 'Button',
        props: {
          onClick: {
            type: 'FUNCTION',
            value: `
              function (a) {
                console.log(a, $$context);
                const stateManager = $$context.stateManager;
                const methods = $$context.getMethods();
                console.log("🚀 ~ methods:", methods)
                const state = stateManager.RowState.state;
                stateManager.RowState.updateState({
                  rowMark: state.rowMark  +1
                })
              }
            `,
          },
        },
        methods: [
          {
            name: 'getAge',
            type: 'FUNCTION',
            value: `function getAge() {
            console.log(12);
            }`,
          },
        ],
        children: ['change row state value'],
      },
      {
        id: '4',
        componentName: 'Row',
        state: {
          rowMark: 1,
        },
        nodeName: 'RowState',
        children: [
          {
            componentName: 'div',
            props: {
              children: {
                type: 'EXPRESSION',
                value:
                  '"rowState to reshow: " + $$context.stateManager.RowState.state.rowMark',
              },
            },
          },
        ],
      },
    ],
  },
};
