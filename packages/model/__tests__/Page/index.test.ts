import { CPage } from '../../src/Page/index';

const mockNodeData = {
  id: '1',
  componentName: 'Header',
  props: {
    key: '1',
    age: 12,
    itemRender: {
      type: 'SLOT',
      value: {
        id: '2',
        componentName: 'Button',
      },
    },
  },
};

const mockPageData = {
  version: '1.0',
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
  it('new a page instance', () => {
    const node = new CPage(mockPageData);
    expect(node).not.toBeNull();
  });

  it('validate a bad page', () => {
    mockPageData.version = 1 as any;
    let isError = false;
    try {
      new CPage(mockPageData);
    } catch (e) {
      isError = true;
    }

    expect(isError).toBeTruthy();
  });
});
