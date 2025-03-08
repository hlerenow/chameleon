import {
  isExpression,
  isFunction,
  TActionLogicItem,
  TargetValueNameObject,
  TDynamicValue,
  TLogicAssignValueItem,
  TLogicCallNodeMethodItem,
  TLogicItemHandlerFlow,
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
    const resultMap: any = {};

    const buildNode = async (nodeItem: TLogicItemHandlerFlow[number]) => {
      const item = nodeItem;
      if (item.type === 'RUN_CODE') {
        const codeFunc = convertCodeStringToFunction({
          funcName: '',
          funcBody: `function() {
           ${item.value} }`,
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
          resultMap[item.id] = await res;
        } else {
          resultMap[item.id] = res;
        }
      }

      if (item.type === 'JUMP_LINK') {
        const func = buildJumpLink(item, options);
        const res = func(...args);
        if (res?.then) {
          resultMap[item.id] = await res;
        } else {
          resultMap[item.id] = res;
        }
      }

      if (item.type === 'REQUEST_API') {
        const { run, afterFailedResponse, afterSuccessResponse } = buildRequestAPI(item, options);

        try {
          const res = run(...args);
          if (res?.then) {
            resultMap[item.id] = await res;
          } else {
            resultMap[item.id] = res;
          }

          /** 写入变量 */
          if (item.responseVarName) {
            options.actionVariableSpace[item.responseVarName] = resultMap[item.id];
          }
          // 处理后置操作
          const res2: any = afterSuccessResponse(resultMap[item.id], ...args);
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
          resultMap[item.id] = await res;
        } else {
          resultMap[item.id] = res;
        }
        if (item.returnVarName) {
          options.actionVariableSpace[item.returnVarName] = resultMap[item.id];
        }
      }
      if (item.type === 'ASSIGN_VALUE') {
        const func = buildAssignValue(item, options);
        let tempArgs = [...args];
        if (options.$$response !== undefined) {
          tempArgs = [options.$$response, tempArgs];
        }
        const res = func(...tempArgs);
        resultMap[item.id] = await res;
      }
    };
    // 从第一节点开始执行逻辑直到，next 为空
    let nextNode: TLogicItemHandlerFlow[number] | undefined = handler[0];
    const hasProcessNodeList = new Set();
    while (nextNode) {
      if (hasProcessNodeList.has(nextNode.id)) {
        // 避免死循环
        return;
      }
      await buildNode(nextNode);
      hasProcessNodeList.add(nextNode.id);
      const tempNode = handler.find((el) => nextNode?.next && el.id === nextNode?.next);
      nextNode = tempNode;
    }
  };
};

function buildJumpLink(item: TLogicJumpLinkItem, option: CommonOption) {
  const linkFunc = buildDynamicValue(item.link, option);
  return linkFunc;
}

const buildDynamicValue = (dynamicValue: TDynamicValue, option: CommonOption) => {
  return function (...args: any[]): any {
    if (isExpression(dynamicValue)) {
      const res = runExpression(dynamicValue.value, {
        ...option.context,
        nodeContext: option.context,
        storeManager: option.storeManager,
        $$response: option.$$response,
        actionVariableSpace: option.actionVariableSpace,
      });
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

    const allNodeList = [...(item.afterSuccessResponse || []), ...(item.afterFailedResponse || [])];

    const func = transformActionNode(
      {
        type: 'ACTION',
        handler: allNodeList,
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
    // 请求或者成功的的同级逻辑可以复用，不允许死循环
    const allNodeList = [...(item.afterFailedResponse || []), ...(item.afterSuccessResponse || [])];

    const func = transformActionNode(
      {
        type: 'ACTION',
        handler: allNodeList,
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

const buildAssignValue = (item: TLogicAssignValueItem, option: CommonOption) => {
  return async (...args: any[]): Promise<any> => {
    const valueFunc = buildDynamicValue(item.currentValue, option);
    const res = valueFunc(...args);
    let result;
    if (res?.then) {
      result = await res;
    } else {
      result = res;
    }
    if (item.valueType === 'STATE') {
      const targetValueName = item.targetValueName as TargetValueNameObject;
      const store = option.storeManager.getStore(targetValueName.nodeId);
      if (store) {
        store.setState({
          [targetValueName.keyPath]: result,
        });
      }
    } else if (item.valueType === 'MEMORY') {
      option.actionVariableSpace[item.targetValueName as string] = result;
    }

    return result;
  };
};
