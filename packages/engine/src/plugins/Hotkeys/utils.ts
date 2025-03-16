import { _keyMap, _modifier } from './keymap';

// 修饰键转换成对应的键码
export function getMods(modifier: string[], key: string[]) {
  const mods = key.slice(0, key.length - 1);
  for (let i = 0; i < mods.length; i++) mods[i] = modifier[mods[i].toLowerCase() as any];
  return mods;
}

// 处理传的key字符串转换成数组
export function getKeys(key: string) {
  if (typeof key !== 'string') key = '';
  key = key.replace(/\s/g, ''); // 匹配任何空白字符,包括空格、制表符、换页符等等
  const keys = key.split(','); // 同时设置多个快捷键，以','分割
  let index = keys.lastIndexOf('');

  // 快捷键可能包含','，需特殊处理
  for (; index >= 0; ) {
    keys[index - 1] += ',';
    keys.splice(index, 1);
    index = keys.lastIndexOf('');
  }

  return keys;
}

// 返回键码
export const getKeycode = (x: string) => {
  return _keyMap[x.toLowerCase()] || (_modifier as any)[x.toLowerCase()] || x.toUpperCase().charCodeAt(0);
};
