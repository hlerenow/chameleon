import { CPageDataType } from '@chameleon/model';
const data = [
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
];

const columns = [
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
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: '99898999',
          componentName: 'Button',
          children: ['123'],
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
];

export const BasePage: CPageDataType = {
  version: '1.0.0',
  pageName: 'BaseDemoPage',
  componentsMeta: [],
  componentsTree: {
    id: '1',
    componentName: 'CPage',
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
                value: '$$context.loopData.index',
              },
            },
            loop: {
              open: true,
              data: {
                type: 'EXPRESSION',
                value: '$$context.state.list',
              },
            },
          },
        ],
      },
      {
        id: 'div12222',
        componentName: 'div',
        children: ['566666'],
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
            value: `
            function (a) {
                $$context.updateGlobalState({
                 modalVisible: false
                });
            }
            `,
          },
        },
        children: ['I am a modal'],
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
            value: `function onClick(a) {
              console.log(a);
              $$context.updateState({a: $$context.state.a + 1})
              $$context.updateGlobalState({
                buttonVisible: !$$context.globalState.buttonVisible,
                modalVisible: !$$context.globalState.modalVisible
              })
            }`,
          },
          children: ['控制右边按钮的显示隐藏'],
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
            value: `function onClick(a) {
              console.log(a);
              $$context.updateState({a: $$context.state.a + 1})
              $$context.updateGlobalState({ b: $$context.globalState.b + 1})
            }`,
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
      },

      {
        id: '3',
        componentName: 'Table',
        state: {
          a: 3,
          data: data,
        },
        props: {
          columns,
          dataSource: {
            type: 'EXPRESSION',
            value: '$$context.state.data',
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
          },
          {
            id: '10',
            componentName: 'Col',
            children: [
              {
                id: '11',
                componentName: 'Button',
                children: ['123 木头人'],
              },
            ],
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
                value: `
                  function(value) {
                    console.log(value, $$context);
                    $$context.updateGlobalState({
                      b: value.target.value
                    })
                  }
                `,
              },
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
                        value: `
                          function (a) {
                            console.log(a);
                            const stateManager = $$context.stateManager;
                            const state = stateManager.RowState.state;
                            stateManager.RowState.updateState({
                              rowMark: state.rowMark  +1
                            })
                          }
                        `,
                      },
                    },
                    children: ['change row state value'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
