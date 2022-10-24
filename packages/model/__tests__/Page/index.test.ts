import { CPage } from '../../src/Page/index';
import { CMaterialType } from '../../src/types/material';
import { CNodeDataType } from '../../src/types/node';
import { CPageDataType } from '../../src/types/page';
import { BasePage } from '@chameleon/demo-page';

const mockMaterial: CMaterialType[] = [
  {
    version: '1.0.0',
    title: '按钮',
    componentName: 'Button',
    props: [
      {
        title: '文案',
        name: 'text',
        valueType: 'string',
      },
    ],
    npm: {
      package: 'demo',
      version: '1.0.0',
      exportName: 'Button',
    },
    snippets: [
      {
        componentName: 'Button',
      },
    ],
  },
  {
    version: '1.0.0',
    title: '页首',
    componentName: 'Header',
    props: [
      {
        name: 'key',
        title: '唯一标记',
        valueType: 'string',
      },
      {
        name: 'age',
        title: '年龄',
        valueType: 'number',
      },
      {
        name: 'itemRender',
        title: 'itemRender',
        valueType: 'string',
      },
    ],
    npm: {
      package: 'demo',
      version: '1.0.0',
      exportName: 'Header',
    },
    snippets: [],
  },
];

const mockNodeData: CNodeDataType = {
  id: '1',
  componentName: 'Header',
  props: {
    key: '1',
    age: 12,
    itemRender: {
      type: 'SLOT',
      renderType: 'COMP',
      value: [
        {
          id: '2',
          componentName: 'Button',
        },
      ],
    },
  },
};

const mockPageData: CPageDataType = {
  version: '1.1.0',
  pageName: 'testPage',
  style: '',
  componentsMeta: [
    {
      componentName: 'Button',
      package: 'antd',
      version: '1.0',
      exportName: 'Button',
    },
  ],
  componentsTree: {
    componentName: 'Page',
    children: [mockNodeData],
  },
};

describe('test page model', () => {
  it('new a page instance with jsslot', () => {
    const node = new CPage(BasePage);
    expect(node).not.toBeNull();
  });

  it('new a page instance', () => {
    const node = new CPage(mockPageData);
    expect(node).not.toBeNull();
  });

  it('validate a bad page', () => {
    const newPageData = {
      ...mockPageData,
    };
    newPageData.version = 1 as any;
    let isError = false;
    try {
      new CPage(newPageData);
    } catch (e) {
      isError = true;
    }

    expect(isError).toBeTruthy();
  });

  it('test export function', () => {
    const page = new CPage(mockPageData, {
      materials: mockMaterial,
    });
    expect(page).not.toBeNull();
    expect(page.emitter).not.toBeUndefined();
    expect(
      page.value.componentsTree.value.children[0].material
    ).not.toBeUndefined();
    expect(page.export()).toMatchSnapshot();
  });
});
