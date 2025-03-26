export function isValidJSVariableName(name: string) {
  // 1. 使用正则表达式验证变量名规则
  const identifierRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
  if (!identifierRegex.test(name)) {
    return false;
  }

  // 2. 检测是否为保留关键字
  try {
    new Function(`let ${name};`);
    return true;
  } catch {
    return false;
  }
}
