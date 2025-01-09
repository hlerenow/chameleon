import {
  isExpression,
  isFunction,
  TActionLogicItem,
  TDynamicValue,
  TLogicCallNodeMethodItem,
  TLogicJumpLinkItem,
  TLogicRequestAPIItem,
} from '@chamn/model';
import { ContextType } from '../../adapter';
import { StoreManager } from '../../storeManager';
import { convertCodeStringToFunction, runExpression } from '../../../util';

type CommonOption = {
  context: ContextType;
  storeManager: StoreManager;
  $$response?: any;
  /** 当前 action 上下文的变量空间 */
  actionVariableSpace: Record<string, string>;
};

export const transformActionNode = (propVal: TActionLogicItem, options: CommonOption) => {
  const handler = propVal.handler;
  const { context, storeManager } = options;
  /** 初始化 */
  if (!options.actionVariableSpace) {
    options.actionVariableSpace = {};
  }

  return async function (...args: any[]) {
    const resultList = [];
    for (let i = 0; i < handler.length; i++) {
      const item = handler[i];
      if (item.type === 'RUN_CODE') {
        const codeFunc = convertCodeStringToFunction({
          funcName: '',
          funcBody: item.value,
          nodeContext: context,
          storeManager: storeManager,
          $$response: options.$$response,
          actionVariableSpace: options.actionVariableSpace,
        });

        let res;
        if (options.$$response !== undefined) {
          res = codeFunc(options.$$response, ...args);
        } else {
          res = codeFunc(...args);
        }

        if (res?.then) {
          resultList[i] = await res;
        } else {
          resultList[i] = res;
        }
      }

      if (item.type === 'JUMP_LINK') {
        const func = buildJumpLink(item, options);
        const res = func(...args);
        if (res?.then) {
          resultList[i] = await res;
        } else {
          resultList[i] = res;
        }
      }

      if (item.type === 'REQUEST_API') {
        const { run, afterFailedResponse, afterSuccessResponse } = buildRequestAPI(item, options);

        try {
          const res = run(...args);
          if (res?.then) {
            resultList[i] = await res;
          } else {
            resultList[i] = res;
          }

          /** 写入变量 */
          if (item.responseVarName) {
            options.actionVariableSpace[item.responseVarName] = resultList[i];
          }
          // 处理后置操作
          const res2: any = afterSuccessResponse(resultList[i], ...args);
          if (res2?.then) {
            return await res2;
          }
          return res2;
        } catch (err) {
          const resFailed: any = await afterFailedResponse(err);
          if (resFailed?.then) {
            return await resFailed;
          } else {
            return resFailed;
          }
        }
      }

      if (item.type === 'CALL_NODE_METHOD') {
        const func = buildCallNodeMethod(item, options);
        const res = func(...args);
        if (res?.then) {
          resultList[i] = await res;
        } else {
          resultList[i] = res;
        }
        if (item.returnVarName) {
          options.actionVariableSpace[item.returnVarName] = resultList[i];
        }
      }
    }
    console.log('action result:', resultList);
  };
};

function buildJumpLink(item: TLogicJumpLinkItem, option: CommonOption) {
  const linkFunc = buildDynamicValue(item.link, option);
  return linkFunc;
}

const buildDynamicValue = (dynamicValue: TDynamicValue, option: CommonOption) => {
  return function (...args: any[]): any {
    if (isExpression(dynamicValue)) {
      const res = runExpression(dynamicValue.value, option.context);
      return res;
    }
    if (isFunction(dynamicValue)) {
      const func = convertCodeStringToFunction({
        funcName: dynamicValue.name || '',
        funcBody: dynamicValue.value,
        nodeContext: option.context,
        storeManager: option.storeManager,
        $$response: option.$$response,
        actionVariableSpace: option.actionVariableSpace,
      });

      return func(...args);
    }

    return dynamicValue;
  };
};

const buildRequestAPI = (item: TLogicRequestAPIItem, option: CommonOption) => {
  const run = function (...args: any[]): any {
    let apiPath = '';
    if (item.apiPath) {
      apiPath = buildDynamicValue(item.apiPath, option)(...args);
    }

    const body: any = item.body || {};

    Object.keys(body).forEach((key) => {
      body[key] = buildDynamicValue(body[key], option)(...args);
    });

    const query = item.query || {};

    Object.keys(query).forEach((key) => {
      query[key] = buildDynamicValue(query[key], option)(...args);
    });
    const header = item.header || {};

    Object.keys(header).forEach((key) => {
      header[key] = buildDynamicValue(header[key], option)(...args);
    });

    const method = item.method || 'GET';

    const res = option.context.requestAPI?.({
      url: apiPath,
      method: method as any,
      header: header,
      body: body,
      query: query,
    });
    return res;
  };

  const afterSuccessResponse = async (response: any, ...args: any[]) => {
    if (!item.afterSuccessResponse) {
      return response;
    }

    const func = transformActionNode(
      {
        type: 'ACTION',
        handler: item.afterSuccessResponse || [],
      },
      {
        ...option,
        $$response: response,
      }
    );

    return func(...args);
  };

  const afterFailedResponse = async (response: any, ...args: any[]) => {
    if (!item.afterFailedResponse) {
      return response;
    }

    const func = transformActionNode(
      {
        type: 'ACTION',
        handler: item.afterFailedResponse || [],
      },
      {
        ...option,
        $$response: response,
      }
    );

    return func(...args);
  };

  return {
    run: run,
    afterSuccessResponse,
    afterFailedResponse,
  };
};

const buildCallNodeMethod = (item: TLogicCallNodeMethodItem, option: CommonOption) => {
  return (...args: any[]): any => {
    console.log(item);

    const codeFunc = convertCodeStringToFunction({
      funcName: '',
      funcBody: `
      function () {
        var args  = arguments;
        var nodeRef = $$context.nodeRefs.get(${JSON.stringify(item.nodeId)});
        if(nodeRef && nodeRef.current) {
          var func = nodeRef.current[${JSON.stringify(item.methodName)}];
          if (func) {
            func.apply(null, args);
          }
        }
        return 999;
      }`,
      nodeContext: option.context,
      storeManager: option.storeManager,
      $$response: option.$$response,
    });

    let customArgs = args;
    if (Array.isArray(item.args)) {
      customArgs = item.args.map((el) => {
        const tempArgs = [option.$$response, ...args].filter(Boolean);
        return buildDynamicValue(el, option)(...tempArgs);
      });
    }

    return codeFunc(...customArgs);
  };
};
