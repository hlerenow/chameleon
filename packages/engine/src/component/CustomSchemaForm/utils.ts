import { SetterBasicType, SetterObjType, SetterType } from '@chameleon/model';

export const getSetterList = <T extends SetterBasicType = any>(
  setters: SetterType<T>[] = []
): SetterObjType[] => {
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
