import { CNodePropsTypeEnum, CPageDataType } from '@chamn/model';

export const LoopButtonPage: CPageDataType = {
  version: '1.0.0',
  name: 'LoopButtonPage',
  componentsMeta: [
    { componentName: 'Button', name: 'antd', package: 'antd', version: '5.x' },
    { componentName: 'Card', name: 'antd', package: 'antd', version: '5.x' },
    { componentName: 'Space', name: 'antd', package: 'antd', version: '5.x' },
    { componentName: 'Tag', name: 'antd', package: 'antd', version: '5.x' },
  ],
  componentsTree: {
    id: 'loop-button-root',
    componentName: 'RootContainer',
    state: {
      releases: [
        {
          id: 'render',
          title: 'Render',
          description: '渲染节点、props 和事件处理。',
          status: 'stable',
        },
        {
          id: 'condition',
          title: 'Condition',
          description: '表达式决定节点是否输出。',
          status: 'testing',
        },
        {
          id: 'loop',
          title: 'Loop',
          description: '循环数据生成重复节点。',
          status: 'ready',
        },
      ],
    },
    children: [
      {
        id: 'loop-button-title',
        componentName: 'div',
        props: {
          style: { margin: '0 auto 16px', maxWidth: 920, color: '#666' },
        },
        children: ['循环使用 RootContainer state 中的 releases 数据。'],
      },
      {
        id: 'loop-button-card',
        componentName: 'Card',
        loop: {
          open: true,
          data: {
            type: CNodePropsTypeEnum.EXPRESSION,
            value: '$$context.stateManager.globalState.state.releases',
          },
          forName: 'release',
          forIndex: 'index',
          key: {
            type: CNodePropsTypeEnum.EXPRESSION,
            value: '$$context.loopData.release.id',
          },
          name: '',
        },
        props: {
          title: {
            type: CNodePropsTypeEnum.EXPRESSION,
            value: '$$context.loopData.release.title',
          },
          style: { maxWidth: 920, margin: '0 auto 12px' },
        },
        children: [
          {
            id: 'loop-button-description',
            componentName: 'div',
            props: {
              children: {
                type: CNodePropsTypeEnum.EXPRESSION,
                value: '$$context.loopData.release.description',
              },
            },
          },
          {
            id: 'loop-button-actions',
            componentName: 'Space',
            props: { size: 12, style: { marginTop: 16 } },
            children: [
              {
                id: 'loop-button-status',
                componentName: 'Tag',
                props: {
                  color: 'green',
                  children: {
                    type: CNodePropsTypeEnum.EXPRESSION,
                    value: '$$context.loopData.release.status',
                  },
                },
              },
              {
                id: 'loop-button-action',
                componentName: 'Button',
                props: {
                  type: 'link',
                  children: '查看循环数据',
                  onClick: {
                    type: CNodePropsTypeEnum.FUNCTION,
                    value:
                      'function () { console.log($$context.loopData.release); }',
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
};
