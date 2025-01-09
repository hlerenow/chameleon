import {
  CNodePropsTypeEnum,
  CPageDataType,
  LogicType,
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
                type: 'RUN_CODE',
                sourceCode: '',
                value: `
                   function () {
                     console.log('12321312');
                     return 555;
                   }
                  `,
              },
              {
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
                    type: 'RUN_CODE',
                    value: `function (apiResult) {
                      console.log($$context, $$response);
                      console.log(77889999, apiResult)
                  }`,
                  },
                  {
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
                    value: `function (apiResult) {
                      console.log(9898989, apiResult, $$context, $$response, $$actionVariableSpace);
                      console.log(77889999,callNodeReturnVar, APIResult)
                  }`,
                  },
                ],
                afterFailedResponse: [
                  {
                    type: 'RUN_CODE',
                    value: `function (apiResult) {
                      console.log($$context, $$response);
                      console.log('errrrror', apiResult)
                  }`,
                  },
                ],
              },
            ],
          },
        },
        eventListener: [
          {
            name: 'onMouseEnter',
            func: {
              type: CNodePropsTypeEnum.ACTION,
              handler: [
                {
                  type: 'RUN_CODE',
                  value: `
                    function (params) {
                      console.log('12321312', $$context, params);
                      return 'Hello eventListener logic'
                    };
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
