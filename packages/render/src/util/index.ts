import { capitalize } from 'lodash-es';
import { Component, createElement } from 'react';
import { ContextType } from '../core/adapter';
import { StoreManager } from '../core/storeManager';
import { AssetPackage, CNode, CNodeModelDataType, CRootNode, ComponentMetaType, LibMetaType } from '@chamn/model';
import { generateObjVarProxy } from './codeRuntimeHelper';

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

export const runExpression = (
  expStr: string,
  options: {
    nodeContext: ContextType;
    storeManager: StoreManager;
    /** 最近一个 API 的返回响应 */
    $$response?: any;
    actionVariableSpace?: Record<any, any>;
    nodeModel: CNode;
  }
) => {
  const run = (expStr: string) => {
    return convertCodeStringToFunction({
      funcBody: `function run () { return ${expStr}; }`,
      funcName: 'run',
      nodeContext: options.nodeContext,
      storeManager: options.storeManager,
      nodeModel: options.nodeModel,
    })();
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

/** 后续考虑是否需要做沙箱 */
export const convertCodeStringToFunction = (params: {
  funcBody: string;
  funcName: string;
  nodeContext: ContextType;
  storeManager: StoreManager;
  /** 最近一个 API 的返回响应 */
  $$response?: any;
  actionVariableSpace?: Record<any, any>;
  nodeModel: CNode;
}) => {
  const {
    funcBody,
    funcName: functionName,
    nodeContext: $$context,
    storeManager,
    $$response,
    nodeModel,
    actionVariableSpace,
  } = params;
  const funcName = functionName || 'anonymous';

  const tempObj = {
    [funcName]: function (...args: any[]) {
      let codeBody;
      const actionVariableSpaceKeyList = Object.keys(actionVariableSpace || {});
      const varListCode = actionVariableSpaceKeyList.map((key) => {
        return `var ${key} = $$ACTION_VAR_SPACE[${JSON.stringify(key)}];`;
      });
      try {
        codeBody = `
  var $$$__args__$$$ = Array.from(arguments);
  function $$_run_$$() {
    var __extraParams = $$$__args__$$$.pop();
    var __$$storeManager__ = __extraParams.storeManager;
    var $ALL_NODE_IDS = Array.from(__$$storeManager__.storeMap.keys().filter(Boolean));;
    var $RESPONSE = __extraParams.$$context;
    var $CTX =  __extraParams.$$context;
    var $$context = $CTX;
    var params = $$context.params;

    var $ACTION_VAR_SPACE = __extraParams.actionVariableSpace;
    // 新增的变量
    var $N_ID = ${JSON.stringify(nodeModel.id)};
    var $NODE_MODAL = __extraParams.nodeModel;
    var $IDS = $ALL_NODE_IDS.reduce(function (res, id) {
        res[id] = id;
        return res;
    }, {});
    var $M = {};
    var $G_STATE = __$$storeManager__.getState('globalState');
    var $STATE = __$$storeManager__.getState($N_ID);
    var $LOOP_DATA = $CTX.loopData;

${generateObjVarProxy('$ALL_STATE', {
  keyListVar: '$ALL_NODE_IDS ',
  getReadValCode: 'return __$$storeManager__.getState(key);',
})}

${generateObjVarProxy('$U_STATE', {
  keyListVar: '$ALL_NODE_IDS ',
  getReadValCode: 'return function (newVal) { __$$storeManager__.setState(key, newVal); }',
})}

    $$context.stateManager = __$$storeManager__.getStateSnapshot();
    // action flowACTION_VAR_SPACE 中定义的变量
    ${varListCode.join(';\n')}

    var $$_f_$$ = ${funcBody.trim() || 'function () {}'};

    return $$_f_$$.apply($$_f_$$, $$$__args__$$$);
  }
  return $$_run_$$();
        `;
        const f = new Function(codeBody);
        return f(...args, { $$context, storeManager, $$response, actionVariableSpace, nodeModel });
      } catch (e) {
        console.log(codeBody);
        console.warn(e);
      }
    },
  };
  return tempObj[funcName];
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
        if (target.__esModule && target.default) {
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

/**
 * 优先访问 sourceObj 上的方法，找不到时访问 targetObj 上的方法
 * @param sourceObj
 * @param targetObj
 * @returns
 */
export const getInheritObj = (sourceObj: Record<any, any>, targetObj: Record<any, any>) => {
  const newObj = {
    ...sourceObj,
  };

  (newObj as any).__proto__ = targetObj;
  return newObj;
};
