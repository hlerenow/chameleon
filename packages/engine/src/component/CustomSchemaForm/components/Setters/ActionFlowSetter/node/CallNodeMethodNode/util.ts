import { CMaterialPropsType, CPageNode, isNodeModel } from '@chamn/model';
import { CommonDynamicValueSetter } from '../../util';

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

const ARGS_PREFIX = 'args.';
/**
 *
 * @param node 结合 method 描述，合并为一个 FormSchema, 加 key 前缀是为了避免 key 冲突
 * @param args
 * @returns
 */
export const getArgsObjFormSchema = (node: CPageNode, methodName: string) => {
  if (isNodeModel(node)) {
    const methodList = node?.material?.value.methods || [];

    const formSchema = methodList
      .find((el) => el.name === methodName)
      ?.params?.map((el, index) => {
        return {
          name: `${ARGS_PREFIX}${index}`,
          title: {
            label: el.name || `arg[${index}]`,
            tip: el.description,
          },
          valueType: 'string',
          setters: CommonDynamicValueSetter,
        } as CMaterialPropsType[number];
      });

    return formSchema || [];
  }
  return [];
};

export const formatArgsObjToArray = (val: Record<string, any>) => {
  const res = Object.keys(val)
    .map((key) => parseInt(key.replace(ARGS_PREFIX, '')))
    .sort()
    .map((index) => val[`${ARGS_PREFIX}${index}`]);
  return res;
};

export const formatArgsToObject = (valArr: any[]) => {
  const res: any = {};
  valArr.forEach((item, index) => {
    res[`${ARGS_PREFIX}${index}`] = item;
  });
  return res;
};
