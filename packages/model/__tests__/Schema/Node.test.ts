import { CNode } from '../../src/Schema/Node/index';

describe('test node model', () => {
  it('new a node instance', () => {
    const mockData = {
      id: '1',
      componentName: 'Header',
      props: {
        key: '1',
        age: 12,
        itemRender: {
          type: 'JSSLOT',
          value: {
            id: '2',
            componentName: 'Button',
          },
        },
      },
    };
    const node = new CNode(mockData);
    expect(node).not.toBeNull();
    expect(node.data.componentName).toEqual(mockData.componentName);
  });

  it('test node without pros', () => {
    const mockData = {
      id: '1',
      componentName: 'Header',
    };
    const node = new CNode(mockData);
    expect(node).not.toBeNull();
  });
});
