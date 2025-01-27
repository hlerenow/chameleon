import { SetterBasicType, SetterObjType, SetterType } from '@chamn/model';

export const getSetterList = <T extends SetterBasicType = ''>(setters: SetterType<T>[] = []): SetterObjType<T>[] => {
  return setters.map((setter) => {
    if (typeof setter === 'string') {
      return {
        componentName: setter as any,
      };
    } else {
      return setter;
    }
  });
};

const setterTypeMap = {
  string: 'StringSetter',
  number: 'NumberSetter',
  boolean: 'BooleanSetter',
  array: 'ArraySetter',
  expression: 'ExpressionSetter',
  function: 'FunctionSetter',
  json: 'JSONSetter',
} as const;

const getValueType = (value: any): keyof typeof setterTypeMap => {
  if (value === undefined || value === null) {
    return 'string';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (typeof value === 'object') {
    if (value.type === 'EXPRESSION') return 'expression';
    if (value.type === 'FUNCTION') return 'function';
    return 'json';
  }

  return typeof value as keyof typeof setterTypeMap;
};

/** 根据值获取默认的 setter */
export const getDefaultSetterByValue = (value: any, setterList: SetterObjType[]) => {
  const valueType = getValueType(value);
  const setterName = setterTypeMap[valueType];
  return setterList.find((setter) => setter.componentName === setterName);
};
