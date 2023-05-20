import { capitalize } from 'lodash-es';
import { Component, createElement } from 'react';
import { ContextType } from '../core/adapter';
import { StoreManager } from '../core/storeManager';
import { AssetPackage } from '@chamn/model';

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
export function shouldConstruct(Component: Function) {
  const prototype = Component.prototype;
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
    try {
      const codeBody = `
        var args = Array.from(arguments);
        function runTimeFunc() {
          var f = ${functionStr};
          var __$$storeManager__ = args.pop();
          console.log("🚀 ~ file: index.ts:82 ~ runTimeFunc ~ __$$storeManager__:", __$$storeManager__, __$$storeManager__.getStateSnapshot().bannerState)
          var $$context = args.pop();
          $$context.stateManager = __$$storeManager__.getStateSnapshot();
          return f.apply(f, args)
        }
        return runTimeFunc();
      `;
      const f = new Function(codeBody);
      f(...args, $$context, storeManager);
    } catch (e) {
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

export const formatSourceStylePropertyName = (style: Record<string, string>) => {
  const newStyle: Record<string, string> = {};
  Object.keys(style).forEach((key) => {
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
    newStyle[newKey.join('')] = style[key];
  });

  return newStyle;
};

export const getCSSTextValue = (cssObj: Record<string, string>) => {
  let res = '';
  Object.keys(cssObj).forEach((key) => {
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
