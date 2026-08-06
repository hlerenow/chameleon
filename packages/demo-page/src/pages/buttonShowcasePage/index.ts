import { CPageDataType } from '@chamn/model';

export const ButtonShowcasePage: CPageDataType = {
  version: '1.0.0',
  name: 'ButtonShowcasePage',
  componentsMeta: [
    { componentName: 'Card', name: 'antd', package: 'antd', version: '5.x' },
    { componentName: 'Button', name: 'antd', package: 'antd', version: '5.x' },
    { componentName: 'Divider', name: 'antd', package: 'antd', version: '5.x' },
    { componentName: 'Space', name: 'antd', package: 'antd', version: '5.x' },
    { componentName: 'Tag', name: 'antd', package: 'antd', version: '5.x' },
  ],
  componentsTree: {
    id: 'button-showcase-root',
    componentName: 'RootContainer',
    children: [
      {
        id: 'button-showcase-card',
        componentName: 'Card',
        props: {
          title: 'Button 样式展示',
          style: { maxWidth: 920, margin: '0 auto' },
        },
        children: [
          {
            id: 'button-showcase-description',
            componentName: 'div',
            props: {
              style: { marginBottom: 16, color: '#666' },
            },
            children: ['覆盖 Ant Design Button 常用类型、禁用态和块级布局。'],
          },
          {
            id: 'button-showcase-types',
            componentName: 'Space',
            props: { wrap: true, size: 12 },
            children: [
              {
                id: 'button-primary',
                componentName: 'Button',
                props: { type: 'primary' },
                children: ['Primary'],
              },
              {
                id: 'button-default',
                componentName: 'Button',
                children: ['Default'],
              },
              {
                id: 'button-dashed',
                componentName: 'Button',
                props: { type: 'dashed' },
                children: ['Dashed'],
              },
              {
                id: 'button-link',
                componentName: 'Button',
                props: { type: 'link' },
                children: ['Link'],
              },
              {
                id: 'button-danger',
                componentName: 'Button',
                props: { danger: true },
                children: ['Danger'],
              },
              {
                id: 'button-disabled',
                componentName: 'Button',
                props: { disabled: true },
                children: ['Disabled'],
              },
            ],
          },
          { id: 'button-showcase-divider', componentName: 'Divider' },
          {
            id: 'button-showcase-block',
            componentName: 'Button',
            props: { type: 'primary', block: true },
            children: ['Block Button'],
          },
          {
            id: 'button-showcase-tags',
            componentName: 'Space',
            props: { wrap: true, size: 8, style: { marginTop: 16 } },
            children: [
              {
                id: 'button-tag-model',
                componentName: 'Tag',
                props: { color: 'blue' },
                children: ['CPageDataType'],
              },
              {
                id: 'button-tag-props',
                componentName: 'Tag',
                props: { color: 'green' },
                children: ['props'],
              },
              {
                id: 'button-tag-children',
                componentName: 'Tag',
                props: { color: 'purple' },
                children: ['children'],
              },
            ],
          },
        ],
      },
    ],
  },
};
