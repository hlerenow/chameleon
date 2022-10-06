import { Component, createElement } from 'react';
import { ContextType } from '../core/adapter';

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

export function canAcceptsRef(Comp: any) {
  const hasSymbol = typeof Symbol === 'function' && Symbol.for;
  const REACT_FORWARD_REF_TYPE = hasSymbol
    ? Symbol.for('react.forward_ref')
    : 0xead0;
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

  return WrapperForRef;
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
    return `[${expStr}] expression run failed`;
  }
};

export const convertCodeStringToFunction = (
  functionStr: string,
  $$context: ContextType
) => {
  const newFunc = function (...args: any[]) {
    try {
      const codeBody = `
        var f = ${functionStr};
        return f.apply(f, arguments)
      `;
      const f = new Function(codeBody);
      f(...args, $$context);
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
