import { translateStaticText } from './staticText';

describe('translateStaticText', () => {
  test('translates built-in editor text to English', () => {
    expect(translateStaticText('组件库', 'en_US')).toBe('Components');
  });

  test('restores translated built-in editor text to Chinese', () => {
    expect(translateStaticText('Components', 'zh_CN')).toBe('组件库');
  });

  test('translates indexed array item labels', () => {
    expect(translateStaticText('元素-3', 'en_US')).toBe('Item-3');
  });
});
