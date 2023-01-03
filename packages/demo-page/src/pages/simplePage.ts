import { CPageDataType } from '@chameleon/model';

export const SamplePage: CPageDataType = {
  version: '1.0.0',
  pageName: 'BaseDemoPage',
  componentsMeta: [],
  componentsTree: {
    id: '1',
    componentName: 'Page',
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
        componentName: 'Button',
        props: {
          onClick: {
            type: 'FUNCTION',
            value: `
              function (a) {
                console.log(a, $$context);
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
        ],
      },
    ],
  },
};
