import { CPage } from '../../src/Page/index';
import { BasePage } from '@chameleon/demo-page';
import { CNode } from '../../src/Page/Schema/Node';
import { CSlot } from '../../src/Page/Schema/Node/slot';
import { CPageDataType } from '../../src/types/page';

const mockPageData = BasePage as CPageDataType;
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

    const newNode4 = new CNode({
      componentName: 'Button',
      children: ['动态添加的按钮 current Before'],
    });
    page.addNode(newNode, node!, 'CHILD_START');
    page.addNode(newNode2, node!, 'CHILD_END');
    page.addNode(newNode3, node!, 'AFTER');
    page.addNode(newNode4, node!, 'BEFORE');
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
    const parentNode = targetNode2?.parent;
    // 当节点不是 CPage 活着 CSlot 时
    if (!(parentNode instanceof CSlot) && !(parentNode instanceof CPage)) {
      expect(parentNode?.value.children[0]).toEqual(n1);
      expect(parentNode?.value.children[2]).toEqual(n2);
    }
  });

  it('test delete node', () => {
    const page = new CPage(mockPageData);

    const targetNode1 = page.getNode('5');
    const targetNode2 = page.getNode('div1');

    page.deleteNode(targetNode1!);
    page.deleteNode(targetNode2!);
    expect(page.getNode('5')).toBeFalsy();
    expect(page.getNode('div1')).toBeFalsy();
  });

  it('test copy a node', () => {
    const page = new CPage(mockPageData);
    const sourceNode = page.getNode('5');
    const newNode = page.copyNodeById('5');
    expect(newNode).not.toBeNull();
    if (newNode) {
      expect(newNode.value.componentName).toEqual('Row');
      expect(newNode.id).not.toEqual(sourceNode?.id);
    }
  });
  it('test move a node', () => {
    const page = new CPage(mockPageData);
    page.moveNodeById('999', '5', 'AFTER');
    page.moveNodeById('5', '2', 'AFTER');
    const targetNode = page.getNode('5');
    const anchorNode = page.getNode('2');
    expect(page.getNode('5')).not.toBeNull();
    expect(targetNode?.parent).toEqual(anchorNode?.parent);
    const parent = anchorNode?.parent as CNode;
    const findNodeRes = parent?.value.children.find((el) => el === targetNode);
    expect(findNodeRes).not.toBeNull();
  });
});
