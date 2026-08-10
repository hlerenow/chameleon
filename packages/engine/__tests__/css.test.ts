jest.mock('@chamn/model', () => ({
  getRandomStr: () => 'test-id',
  isExpression: () => false,
}));

jest.mock('lodash-es', () => ({
  isPlainObject: (value: unknown) => Boolean(value && typeof value === 'object' && !Array.isArray(value)),
}));

import { updateNodeSizeStyle } from '@/utils/css';

describe('updateNodeSizeStyle', () => {
  it('updates the default CSS when the PC media is active below the PC viewport width', () => {
    const node = {
      value: {
        css: {
          value: [
            {
              state: 'normal',
              text: 'color: red;',
              media: [{ type: 'max-width' as const, value: '1200', text: 'width: 100px; height: 80px;' }],
            },
          ],
        },
      },
      updateValue(update: { css: unknown }) {
        this.value.css = update.css as typeof this.value.css;
      },
    };

    updateNodeSizeStyle(node as any, { width: 320, height: 240, viewportWidth: 1000 });

    const normalCss = node.value.css.value[0];
    expect(normalCss.text).toContain('width:320px;');
    expect(normalCss.text).toContain('height:240px;');
    expect(normalCss.media?.[0].text).toContain('width:320px;');
    expect(normalCss.media?.[0].text).toContain('height:240px;');
  });
});
