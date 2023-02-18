import { CPageDataType } from '@chameleon/model';

export const PageData: CPageDataType = {
  version: '1.0.0',
  pageName: 'BaseDemoPage',
  componentsMeta: [],
  componentsTree: {
    componentName: 'RootContainer',
    props: {
      a: 1,
    },
    state: {
      b: 1,
      buttonVisible: true,
      modalVisible: false,
    },
    children: [
      {
        id: 'row11111',
        componentName: 'Row',
        configure: {},
      },
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
        configure: {
          props: {},
        },
      },
      {
        id: 'div1',
        componentName: 'div',
        children: [
          {
            id: 'div1btn',
            componentName: 'Button',
            state: {
              list: [11, 22, 33, 44, 55],
            },
            props: {
              children: {
                type: 'EXPRESSION',
                value: '$$context.loopData',
              },
            },
            loop: {
              open: true,
              data: {
                type: 'EXPRESSION',
                value: '$$context.state.list',
              },
              key: {
                type: 'EXPRESSION',
                value: '$$context.loopData.item',
              },
            },
            configure: {
              props: {},
            },
          },
        ],
        configure: {
          props: {},
        },
      },
      {
        id: 'div12222',
        componentName: 'div',
        children: ['566666'],
        configure: {
          props: {},
        },
      },
      {
        id: 'Modal',
        componentName: 'Modal',
        refId: 'ModalRef',
        props: {
          open: {
            type: 'EXPRESSION',
            value: '$$context.globalState.modalVisible',
          },
          onCancel: {
            type: 'FUNCTION',
            value:
              '\n            function (a) {\n                $$context.updateGlobalState({\n                 modalVisible: false\n                });\n            }\n            ',
          },
        },
        children: ['I am a modal'],
        configure: {
          props: {},
        },
      },
      {
        id: '999',
        componentName: 'Button',
        state: {
          a: 1,
        },
        props: {
          type: 'primary',
          onClick: {
            type: 'FUNCTION',
            value:
              // eslint-disable-next-line quotes
              "function onClick(a) {\n  console.log(11111, a);\n  $$context.updateState({ a: $$context.state.a + 1 })\n  $$context.updateGlobalState({\n    buttonVisible: !$$context.globalState.buttonVisible,\n    modalVisible: !$$context.globalState.modalVisible\n  })\n\n  const demoBtnState = $$context.stateManager['demoBtn'];\n  console.log($$context.stateManager, demoBtnState);\n}",
          },
          children: ['控制右边按钮的显示隐藏'],
        },
        loop: {
          open: false,
          data: [],
          forName: 'item',
          forIndex: 'index',
          key: '',
          name: '',
        },
        condition: true,
        refId: '12323',
        configure: {
          props: {},
        },
      },
      {
        id: '2',
        componentName: 'Button',
        state: {
          a: 1,
        },
        props: {
          type: 'primary',
          onClick: {
            type: 'FUNCTION',
            value:
              'function onClick(a) {\n              console.log(a);\n              $$context.updateState({a: $$context.state.a + 1})\n              $$context.updateGlobalState({ b: $$context.globalState.b + 1})\n            }',
          },
          children: {
            type: 'EXPRESSION',
            value: '$$context.globalState.b',
          },
        },
        condition: {
          type: 'EXPRESSION',
          value: '$$context.globalState.buttonVisible',
        },
        configure: {
          props: {
            children: {
              name: 'children',
              setter: 'ExpressionSetter',
            },
          },
        },
        loop: {
          open: false,
          data: [],
          forName: 'item',
          forIndex: 'index',
          key: '',
          name: '',
        },
        refId: 'demoBtn',
      },
      {
        id: '3',
        componentName: 'Table',
        state: {
          a: 3,
          data: [
            {
              key: '1',
              name: 'John Brown',
              age: 32,
              address: 'New York No. 1 Lake Park',
              tags: ['nice', 'developer'],
            },
            {
              key: '2',
              name: 'Jim Green',
              age: 42,
              address: 'London No. 1 Lake Park',
              tags: ['loser'],
            },
            {
              key: '3',
              name: 'Joe Black',
              age: 32,
              address: 'Sidney No. 1 Lake Park',
              tags: ['cool', 'teacher'],
            },
          ],
        },
        props: {
          name: 111,
          testArrayString: [1, 2, 3, 4, 5],
          columns: [
            {
              title: 'Name',
              dataIndex: 'name',
              key: 'name',
              render: {
                type: 'SLOT',
                renderType: 'FUNC',
                params: ['val', 'record', 'index'],
                value: [
                  {
                    id: '5',
                    componentName: 'Row',
                    children: [
                      {
                        id: '6',
                        componentName: 'Button',
                        props: {
                          mark: 'nameRender',
                          children: {
                            type: 'EXPRESSION',
                            value: '$$context.params.val',
                          },
                        },
                        configure: {
                          props: {},
                        },
                      },
                      {
                        id: '7',
                        componentName: 'Col',
                        children: [
                          {
                            componentName: 'Button',
                            props: {
                              mark: 'nameRender',
                            },
                            children: [
                              {
                                id: '8',
                                componentName: 'div',
                                children: ['I am div'],
                                configure: {
                                  props: {},
                                },
                              },
                            ],
                            id: 'drv44f',
                            configure: {
                              props: {},
                            },
                          },
                        ],
                        configure: {
                          props: {},
                        },
                      },
                    ],
                    configure: {
                      props: {},
                    },
                  },
                  {
                    id: '99898999',
                    componentName: 'Button',
                    children: ['123'],
                    configure: {
                      props: {},
                    },
                  },
                ],
              },
            },
            {
              title: 'Age',
              dataIndex: 'age',
              key: 'age',
            },
            {
              title: 'Address',
              dataIndex: 'address',
              key: 'address',
            },
            {
              title: 'Tags',
              key: 'tags',
              dataIndex: 'tags',
            },
            {
              title: 'Action',
              key: 'action',
            },
          ],
          dataSource: {
            type: 'EXPRESSION',
            value: '$$context.state.data',
          },
        },
        configure: {
          props: {
            name: {
              name: 'ArraySetter',
              setter: 'ArraySetter',
            },
            'columns.0.title': {
              name: 'StringSetter',
              setter: 'NumberSetter',
            },
          },
        },
      },
      {
        id: '4',
        componentName: 'Row',
        state: {
          rowMark: 1,
        },
        stateName: 'RowState',
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
            id: 'spnffg',
            configure: {
              props: {},
            },
          },
          {
            id: '10',
            componentName: 'Col',
            children: [
              {
                id: '11',
                componentName: 'Button',
                children: ['123 木头人'],
                configure: {
                  props: {},
                },
              },
            ],
            configure: {
              props: {},
            },
          },
          {
            id: '12',
            componentName: 'Input',
            props: {
              value: {
                type: 'EXPRESSION',
                value: '$$context.globalState.b',
              },
              onChange: {
                type: 'FUNCTION',
                value:
                  '\n                  function(value) {\n                    console.log(value, $$context);\n                    $$context.updateGlobalState({\n                      b: value.target.value\n                    })\n                  }\n                ',
              },
            },
            configure: {
              props: {},
            },
          },
          {
            componentName: 'div',
            children: [
              '2222',
              {
                componentName: 'div',
                children: [
                  '1111',
                  {
                    componentName: 'Button',
                    props: {
                      onClick: {
                        type: 'FUNCTION',
                        value:
                          '\n                          function (a) {\n                            console.log(a);\n                            const stateManager = $$context.stateManager;\n                            const state = stateManager.RowState.state;\n                            stateManager.RowState.updateState({\n                              rowMark: state.rowMark  +1\n                            })\n                          }\n                        ',
                      },
                    },
                    children: ['change row state value'],
                    id: 'n926af',
                    configure: {
                      props: {},
                    },
                  },
                ],
                id: 'lcj371',
                configure: {
                  props: {},
                },
              },
            ],
            id: 'hq1ng3',
            configure: {
              props: {},
            },
          },
        ],
        configure: {
          props: {},
        },
      },
    ],
  },
};
