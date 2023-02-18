import { CPage } from '../../src/Page/index';
import { CMaterialType } from '../../src/types/material';
import { CNodeDataType } from '../../src/types/node';
import { CPageDataType } from '../../src/types/page';
import { BasePage } from '@chameleon/demo-page';
import { InnerComponentNameEnum } from '../../src/types/schema';

const mockMaterial: CMaterialType[] = [
  {
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
        title: '测试按钮',
        schema: {
          componentName: 'Button',
        },
      },
    ],
  },
  {
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
    componentName: InnerComponentNameEnum.PAGE,
    children: [mockNodeData],
  },
};

describe('test page model', () => {
  it('new a page instance with jsslot', () => {
    const node = new CPage(BasePage as any);
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

  it('test page init with material', () => {
    const page = new CPage(mockPageData, {
      materials: mockMaterial,
    });
    expect(page).not.toBeNull();
    expect(page.emitter).not.toBeUndefined();
    expect(
      page.value.componentsTree.value.children[0].material
    ).not.toBeUndefined();
  });
});
