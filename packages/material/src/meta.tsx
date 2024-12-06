import { CSetter } from '@chamn/engine';
import { CMaterialType } from '@chamn/model';

const moduleFiles = import.meta.glob('./**/*/meta.ts*', {
  eager: true,
});

const metaList: CMaterialType[] = [];

Object.keys(moduleFiles).forEach((key: any) => {
  const el: any = moduleFiles[key];
  metaList.push(...el.default);
});

const setterFiles = import.meta.glob('./setter/*/index.tsx', {
  eager: true,
});

let setterMap: Record<string, CSetter<any>> = {};
Object.keys(setterFiles).forEach((key: any) => {
  const el: any = setterFiles[key];
  setterMap = {
    ...setterMap,
    ...el,
  };
});

export default {
  meta: metaList,
  setter: setterMap,
  version: __PACKAGE_VERSION__,
  package: __PACKAGE_NAME__,
  globalName: __GLOBAL_LIB_NAME__,
};
