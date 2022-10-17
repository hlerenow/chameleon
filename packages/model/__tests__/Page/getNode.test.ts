import { CPage } from '../../src/Page/index';
import { BasePage } from '@chameleon/demo-page';

const mockPageData = BasePage;
describe('test page model', () => {
  it('test getNode', () => {
    const page = new CPage(mockPageData);
    const node = page.getNode('5');
    const node2 = page.getNode('10');
    expect(node).not.toBeNull();
  });
});
