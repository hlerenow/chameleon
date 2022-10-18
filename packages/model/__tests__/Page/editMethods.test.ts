import { CPage } from '../../src/Page/index';
import { BasePage } from '@chameleon/demo-page';
import { CNode } from '../../src/Page/Schema/Node';

const mockPageData = BasePage;
describe('test page model methods', () => {
  it('test getNode', () => {
    const page = new CPage(mockPageData);
    const node = page.getNode('5');
    const node2 = page.getNode('10');
    const node3 = page.getNode('1110');
    expect(node).not.toBeNull();
    expect(node2).not.toBeNull();
    expect(node3).toBeNull();
  });

  it('test addNode', () => {
    const page = new CPage(mockPageData);
    const node = page.getNode('5');
    const newNode = new CNode({
      componentName: 'Button',
      children: ['动态添加的按钮'],
    });
    const newNode2 = new CNode({
      componentName: 'Button',
      children: ['动态添加的按钮 end'],
    });
    const newNode3 = new CNode({
      componentName: 'Button',
      children: ['动态添加的按钮 current After'],
    });
    page.addNode(newNode, node!, 'CHILD_START');
    page.addNode(newNode2, node!, 'CHILD_END');
    page.addNode(newNode3, node!, 'AFTER');
    expect(node?.value.children[0]).toEqual(newNode);
    expect(node?.value.children[node?.value.children.length - 1]).toEqual(
      newNode2
    );
  });
  it('test addNode on child BEFORE and AFTER', () => {
    const page = new CPage(mockPageData);

    const targetNode2 = page.getNode('div1');
    const n1 = new CNode({
      componentName: 'Button',
      children: ['动态添加的按钮 current normal After'],
    });
    const n2 = new CNode({
      componentName: 'Button',
      children: ['动态添加的按钮 current normal After'],
    });
    page.addNode(n1, targetNode2!, 'BEFORE');
    page.addNode(n2, targetNode2!, 'AFTER');

    expect(targetNode2?.parent?.value.children[0]).toEqual(n1);
    expect(targetNode2?.parent?.value.children[2]).toEqual(n2);
  });
});
