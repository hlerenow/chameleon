import { CNodePropsTypeEnum, CPageDataType } from '@chamn/model';

export const InteractiveButtonPage: CPageDataType = {
  version: '1.0.0',
  name: 'InteractiveButtonPage',
  componentsMeta: [
    { componentName: 'Alert', name: 'antd', package: 'antd', version: '5.x' },
    { componentName: 'Button', name: 'antd', package: 'antd', version: '5.x' },
    { componentName: 'Card', name: 'antd', package: 'antd', version: '5.x' },
    { componentName: 'Space', name: 'antd', package: 'antd', version: '5.x' },
    { componentName: 'Tag', name: 'antd', package: 'antd', version: '5.x' },
  ],
  componentsTree: {
    id: 'interactive-button-root',
    componentName: 'RootContainer',
    children: [
      {
        id: 'interactive-button-card',
        componentName: 'Card',
        props: {
          title: '节点 State 与条件渲染',
          style: { maxWidth: 920, margin: '0 auto' },
        },
        children: [
          {
            id: 'interactive-button-description',
            componentName: 'div',
            props: { style: { marginBottom: 16, color: '#666' } },
            children: ['两个按钮分别验证节点 state 更新和 condition 表达式。'],
          },
          {
            id: 'interactive-button-actions',
            componentName: 'Space',
            props: { wrap: true, size: 12 },
            children: [
              {
                id: 'interactive-counter-button',
                nodeName: 'interactiveCounterButton',
                componentName: 'Button',
                state: { count: 0 },
                props: {
                  type: 'primary',
                  children: {
                    type: CNodePropsTypeEnum.EXPRESSION,
                    value: '`点击次数：${$$context.state.count}`',
                  },
                  onClick: {
                    type: CNodePropsTypeEnum.FUNCTION,
                    value:
                      'function () { $$context.updateState({ count: $$context.state.count + 1 }); }',
                  },
                },
              },
              {
                id: 'interactive-detail-button',
                nodeName: 'interactiveDetailButton',
                componentName: 'Button',
                state: { visible: false },
                props: {
                  children: {
                    type: CNodePropsTypeEnum.EXPRESSION,
                    value: '$$context.state.visible ? "隐藏详情" : "显示详情"',
                  },
                  onClick: {
                    type: CNodePropsTypeEnum.FUNCTION,
                    value:
                      'function () { $$context.updateState({ visible: !$$context.state.visible }); }',
                  },
                },
              },
            ],
          },
          {
            id: 'interactive-counter-tag',
            componentName: 'Tag',
            props: {
              color: 'blue',
              style: { display: 'inline-block', marginTop: 16 },
              children: {
                type: CNodePropsTypeEnum.EXPRESSION,
                value:
                  '`Store count: ${$$context.stateManager.interactiveCounterButton.state.count}`',
              },
            },
          },
          {
            id: 'interactive-detail-alert',
            componentName: 'Alert',
            condition: {
              type: CNodePropsTypeEnum.EXPRESSION,
              value:
                '$$context.stateManager.interactiveDetailButton.state.visible',
            },
            props: {
              type: 'success',
              showIcon: true,
              message: '条件渲染已启用',
              description:
                'Alert 根据 interactiveDetailButton 的 state.visible 渲染。',
              style: { marginTop: 16 },
            },
          },
        ],
      },
    ],
  },
};
