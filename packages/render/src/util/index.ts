import { capitalize } from 'lodash-es';
import { Component, createElement } from 'react';
import { ContextType } from '../core/adapter';
import { StoreManager } from '../core/storeManager';
import { AssetPackage, CNode, CNodeModelDataType, CRootNode, ComponentMetaType, LibMetaType } from '@chamn/model';

export const isClass = function (val: any) {
  if (!val) {
    return false;
  }
  if (typeof val !== 'function') {
    return false;
  }
  if (!val.prototype) {
    return false;
  }
  return true;
};

// eslint-disable-next-line @typescript-eslint/ban-types
export function shouldConstruct(Component: any) {
  const prototype = Component?.prototype;
  return !!(prototype && prototype.isReactComponent);
}

export function canAcceptsRef(Comp: any) {
  const hasSymbol = typeof Symbol === 'function' && Symbol.for;
  const REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
  return (
    Comp?.$$typeof === REACT_FORWARD_REF_TYPE ||
    Comp?.prototype?.isReactComponent ||
    Comp?.prototype?.setState ||
    Comp._forwardRef
  );
}

export function compWrapper(Comp: any) {
  class WrapperForRef extends Component {
    render() {
      // 需要直接调用 react api ,避免被拦截 !!!!
      return createElement(Comp, this.props);
    }
  }
  (WrapperForRef as any).displayName = Comp.displayName;

  return WrapperForRef as any;
}

export const runExpression = (expStr: string, context: any) => {
  const run = (expStr: string) => {
    const contextVar = Object.keys(context).map((key) => {
      return `const ${key} = $$context['${key}'];`;
    });
    const executeCode = `
    ${contextVar.join('\n')}
    return ${expStr};
    `;
    return new Function('$$context', executeCode)(context);
  };
  try {
    return run(expStr);
  } catch (e) {
    console.warn(e);
    const msg = `[${expStr}] expression run failed`;
    console.warn(msg);
    return null;
  }
};

export const convertCodeStringToFunction = (
  functionStr: string,
  $$context: ContextType,
  storeManager: StoreManager
) => {
  const newFunc = function (...args: any[]) {
    let codeBody;

    try {
      codeBody = `
var $$$__args__$$$ = Array.from(arguments);
function $$_run_$$() {
  var $$_f_$$ = ${functionStr || 'function () {}'};
  var __$$storeManager__ = $$$__args__$$$.pop();
  var $$context = $$$__args__$$$.pop();
  $$context.stateManager = __$$storeManager__.getStateSnapshot();
  return $$_f_$$.apply($$_f_$$, $$$__args__$$$);
}
return $$_run_$$();
      `;
      const f = new Function(codeBody);
      f(...args, $$context, storeManager);
    } catch (e) {
      console.log(codeBody);
      console.warn(e);
    }
  };
  return newFunc;
};

/**
 *
 * @param args 对象的值
 * @param argsName 对因位置的 名称
 * @returns
 */
export const getObjFromArrayMap = (args: any[], argsName: string[]) => {
  const params: Record<any, any> = {};
  argsName.forEach((paramName, index) => {
    params[paramName] = args[index];
  });

  return params;
};

export const formatSourceStylePropertyName = (styleList: CNodeModelDataType['style'] = []) => {
  const newStyle: Record<string, string> = {};
  styleList.forEach(({ property: key, value }) => {
    // 处理 css 前缀
    let preKey = key.replace('-webkit', 'Webkit');
    preKey = preKey.replace('-ms', 'ms');
    preKey = preKey.replace('-moz', 'Moz');
    preKey = preKey.replace('-o', 'O');
    let newKey = preKey.split('-');
    if (newKey.length >= 2) {
      newKey = newKey.map((val, index) => {
        if (index !== 0) {
          return capitalize(val);
        } else {
          return val;
        }
      });
    }
    newStyle[newKey.join('')] = value as string;
  });

  return newStyle;
};

export const getCSSTextValue = (cssObj: Record<string, string>) => {
  let res = '';
  Object.keys(cssObj || {}).forEach((key) => {
    res += `${key}:${cssObj[key]};`;
  });
  return res;
};

export const collectVariable = (assetPackages: AssetPackage[], win: Window) => {
  const res: Record<string, any> = {};
  assetPackages.forEach((el) => {
    if (el.globalName) {
      const target = (win as any)[el.globalName];
      if (target) {
        res[el.globalName] = target;
        if (target.__esModule) {
          res[el.globalName] = target.default;
        }
      }
    }
  });
  return res;
};

export const flatObject = (obj: Record<string, any>, level = 1) => {
  let count = 0;
  let currentObj = obj;
  let newObj: Record<string, any> = {};
  let res = {};
  while (count < level) {
    Object.keys(currentObj).forEach((key) => {
      newObj = {
        ...newObj,
        ...currentObj[key],
      };
    });
    res = newObj;
    currentObj = newObj;
    newObj = {};
    count += 1;
  }

  return res;
};

export const getMatchVal = (val: string, regArr: RegExp[]) => {
  const list: string[] = [];
  regArr.forEach((el) => {
    const reg = el;
    const res = reg.exec(val);
    if (res?.length) {
      list.push(res[1]);
    }
  });
  return list;
};

const getLibsByList = (libs: Record<string, any>, list: LibMetaType[]) => {
  const newRes: Record<string, any> = {};
  list.forEach((el) => {
    if (libs[el.name]) {
      newRes[el.name] = libs[el.name];
    }
  });

  return newRes;
};

export const getComponentsLibs = (libs: Record<string, any>, list: ComponentMetaType[]) => {
  return getLibsByList(libs, list);
};

export const getThirdLibs = (libs: Record<string, any>, list: LibMetaType[]) => {
  return getLibsByList(libs, list);
};

export const getNodeCssClassName = (node: CNode | CRootNode) => {
  const nodeClassName = node.value.css?.class || `c_${node.id}`;
  return nodeClassName;
};

export const findComponentByChainRefer = (componentReferPath: string, components: Record<string, any>) => {
  const componentPath = componentReferPath.split('.');
  let res;
  let tempMap = components;

  componentPath.forEach((key) => {
    res = tempMap?.[key];
    tempMap = res;
  });

  return res || (() => `Component [${componentReferPath}] not found`);
};
