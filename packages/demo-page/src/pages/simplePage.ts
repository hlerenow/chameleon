import { CNodePropsTypeEnum, CPageDataType, LogicType } from '@chamn/model';

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
        eventListener: [
          {
            name: 'onClick',
            func: {
              type: CNodePropsTypeEnum.ACTION,
              handler: [
                {
                  type: 'RUN_CODE',
                  value: `
                    console.log('12321312');
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
