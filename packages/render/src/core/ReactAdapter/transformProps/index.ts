import {
  CPropDataType,
  isPropModel,
  isSlotModel,
  CNode,
  isExpression,
  FunctionPropType,
  CProp,
  isFunction,
  isAction,
} from '@chamn/model';
import { isPlainObject } from 'lodash-es';
import React from 'react';
import { DYNAMIC_COMPONENT_TYPE } from '../../../const';
import { getObjFromArrayMap, shouldConstruct, runExpression, convertCodeStringToFunction } from '../../../util';
import { ContextType } from '../../adapter';
import { getContext, renderComponent } from '../help';
import { convertModelToComponent } from '../convertModelToComponent';
import { TRenderBaseOption } from '../type';
import { transformActionNode } from './actionNode';

export const transformProps = (
  originalProps: Record<string, any> = {},
  option: {
    $$context: ContextType;
    nodeModel: CNode;
  } & TRenderBaseOption
) => {
  const { $$context: parentContext, getComponent, storeManager } = option;
  const propsModel = originalProps;
  const handlePropVal: (propVal: CPropDataType) => Record<string, any> = (propVal: CPropDataType) => {
    if (Array.isArray(propVal)) {
      return propVal.map((it) => handlePropVal(it));
    } else if (isPropModel(propVal)) {
      return handlePropVal(propVal.value);
    } else if (isSlotModel(propVal)) {
      const slotProp = propVal.value;
      const tempVal = slotProp.value;
      if (!tempVal) {
        console.warn('slot value is null, this maybe cause some error, pls check it', originalProps);
        return () => {};
      }
      const handleSingleSlot = (it: CNode) => {
        const key = `${it.id}-${DYNAMIC_COMPONENT_TYPE}`;

        const component = getComponent(it);
        const PropNodeRender = convertModelToComponent(component, it, {
          ...option,
        });
        const parmaList = slotProp.params || [];
        // 运行时组件函数
        const PropNodeFuncWrap = (...args: any) => {
          const params: Record<any, any> = getObjFromArrayMap(args, parmaList);
          const $$context = getContext(
            {
              params,
              nodeRefs: parentContext.nodeRefs,
              // 使用空函数，避免获取到父节点的方法或者函数
              getProps: function (): void {},
              callEventMethod: function (): void {},
            },
            parentContext
          );
          return renderComponent(PropNodeRender, {
            $$context,
            key,
          });
        };
        const res = {
          component: PropNodeFuncWrap,
          key,
        };
        return res;
      };
      if (Array.isArray(tempVal)) {
        const renderList = tempVal?.map((it: any) => {
          return handleSingleSlot(it);
        });
        return (...args: any[]) => {
          return renderList.map((renderItem) => {
            const isClassComponent = shouldConstruct(renderItem.component);

            if (isClassComponent) {
              const comp = renderItem.component as any;
              return React.createElement(comp, {
                $$context: parentContext,
                key: renderItem.key,
              });
            } else {
              const comp = renderItem.component as any;
              return comp?.(...args);
            }
          });
        };
      } else {
        return handleSingleSlot(tempVal).component;
      }
    } else if (isExpression(propVal)) {
      const expProp = propVal;
      const newVal = runExpression(expProp.value, {
        nodeContext: parentContext,
        storeManager: option.storeManager,
        nodeModel: option.nodeModel,
      });
      return newVal;
    } else if (isFunction(propVal)) {
      const funcProp = propVal as FunctionPropType;
      return convertCodeStringToFunction({
        funcBody: funcProp.value,
        funcName: funcProp.name || '',
        nodeContext: parentContext,
        storeManager: storeManager,
        nodeModel: option.nodeModel,
      });
    } else if (isAction(propVal)) {
      const newVal = transformActionNode(propVal, {
        context: parentContext,
        storeManager: storeManager,
        actionVariableSpace: {},
        nodeModel: option.nodeModel,
      });
      return newVal;
    } else if (isPlainObject(propVal)) {
      // 可能是 普通的 props 模型
      let specialPropVal: any = propVal;
      if (isPropModel(propVal)) {
        specialPropVal = (propVal as CProp).value;
      }
      const objPropVal = specialPropVal as Record<string, any>;
      const newVal: Record<string, any> = {};
      Object.keys(specialPropVal).forEach((k) => {
        newVal[k] = handlePropVal(objPropVal[k]);
      });
      return newVal;
    } else {
      return propVal;
    }
  };
  const newProps: Record<string, any> = {};
  Object.keys(propsModel).forEach((propKey) => {
    const propVal = propsModel[propKey];
    newProps[propKey] = handlePropVal(propVal);
  });

  return newProps;
};
