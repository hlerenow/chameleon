import React from 'react';
import {
  CJSSlotPropDataType,
  CNode,
  CPage,
  CProp,
  CPropDataType,
  CSchema,
  isJSSlotPropNode,
  RenderPropType,
  transformObjToPropsModelObj,
} from '@chameleon/model';
import { AdapterOptionsType, AdapterType, getAdapter } from './adapter';
import { isPlainObject } from 'lodash-es';

class DefineReactAdapter implements Partial<AdapterType> {
  components: AdapterOptionsType['components'] | undefined;
  getComponent(currentNode: CNode | CSchema) {
    const componentName = currentNode.value.componentName;
    const res =
      this.components?.[componentName] || (() => 'Component not found');
    return res;
  }

  pageRender(
    pageModel: CPage,
    { runtimeHelper, components }: AdapterOptionsType
  ) {
    this.components = components;
    //做一些全局 store 操作
    const rootNode = pageModel.value.componentsTree;
    const component = this.getComponent(rootNode);
    const children: any[] = [];
    const childModel = rootNode.value.children;
    childModel.forEach((node) => {
      children.push(runtimeHelper.renderComponent(node));
    });

    const props: any = {};

    const propsModel = rootNode.props;
    Object.keys(propsModel).forEach((key) => {
      props[key] = propsModel[key].value;
    });
    return this.componentRender(component, props, ...children);
  }

  componentRender(
    originalComponent: any,
    props?:
      | (React.InputHTMLAttributes<HTMLInputElement> &
          React.ClassAttributes<HTMLInputElement>)
      | null
      | undefined,
    ...children: React.ReactNode[]
  ) {
    if (typeof originalComponent === 'string') {
      return originalComponent;
    }
    return React.createElement(originalComponent, props, ...children);
  }

  transformProps(originalProps: Record<any, any> = {}) {
    const propsModel = originalProps;
    const handlePropVal: any = (propVal: any) => {
      if (isJSSlotPropNode(propVal)) {
        const tempVal = propVal;
        if (Array.isArray(propVal)) {
          const renderList = tempVal.value?.map((it: any) => {
            const component = this.getComponent(it);
            return this.convertModelToComponent(component);
          });
          return renderList;
        } else {
          const component = this.getComponent(tempVal.value);
          return this.convertModelToComponent(component);
        }
      } else if (Array.isArray(propVal)) {
        return propVal.map((it) => handlePropVal(it));
      } else if (isPlainObject(propVal)) {
        const newVal: any = {};
        Object.keys(propVal).forEach((k) => {
          newVal[k] = handlePropVal(propVal[k]);
        });
        return newVal;
      } else {
        return propVal;
      }
    };
    const newProps: Record<any, any> = {};
    Object.keys(propsModel).forEach((propKey) => {
      const propVal = propsModel[propKey];
      newProps[propKey] = handlePropVal(propVal);
    });

    return newProps;
  }

  convertModelToComponent(originalComponent: any) {
    return (props: Record<any, any>) => {
      // handle props
      const newProps: Record<any, any> = this.transformProps(props);
      console.log(
        '🚀 ~ file: adapter-react.ts ~ line 79 ~ DefineReactAdapter ~ return ~ newProps',
        newProps
      );
      const children: any[] = [];
      // handle children
      return this.componentRender(
        originalComponent,
        { ...newProps },
        ...children
      );
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const ReactAdapter = getAdapter(new DefineReactAdapter());
