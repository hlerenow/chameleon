import { canNodeSizeChange } from '../src/nodeSizeChange';

const createInstance = (
  value: Record<string, unknown>,
  enableNodeSizeChange: boolean | ((node: any) => boolean) = true
) =>
  ({
    _NODE_MODEL: {
      material: { value: { enableNodeSizeChange } },
      value,
    },
  } as any);

describe('canNodeSizeChange', () => {
  it('requires the material configuration to be explicitly enabled', () => {
    expect(canNodeSizeChange(createInstance({}, false))).toBe(false);
    expect(canNodeSizeChange(createInstance({}))).toBe(true);
  });

  it('evaluates the material callback with the current node', () => {
    const enableNodeSizeChange = jest.fn((node: any) => node.value.componentName === 'CImage');
    expect(canNodeSizeChange(createInstance({ componentName: 'CImage' }, enableNodeSizeChange))).toBe(true);
    expect(canNodeSizeChange(createInstance({ componentName: 'CText' }, enableNodeSizeChange))).toBe(false);
    expect(enableNodeSizeChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: expect.objectContaining({ componentName: 'CText' }) })
    );
  });

  it.each([
    ['inline style', { style: [{ property: 'display', value: 'inline' }] }],
    ['hidden style', { style: [{ property: 'display', value: 'none' }] }],
    ['inline css', { css: { value: [{ state: 'normal', text: 'display: inline;' }] } }],
    [
      'hidden responsive css',
      {
        css: {
          value: [{ state: 'normal', media: [{ type: 'max-width', value: '768', text: 'display: none;' }] }],
        },
      },
    ],
  ])('rejects nodes with %s', (_, value) => {
    expect(canNodeSizeChange(createInstance(value))).toBe(false);
    expect(canNodeSizeChange(createInstance(value), true)).toBe(false);
  });
});
