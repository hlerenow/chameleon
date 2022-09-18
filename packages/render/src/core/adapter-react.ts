import React from 'react';
import { CNode, CPage, CSchema } from '@chameleon/model';
import { AdapterOptionsType, AdapterType, getAdapter } from './adapter';

class DefineReactAdapter implements Partial<AdapterType> {
  getComponent(
    currentNode: CNode | CSchema,
    components: { [x: string]: (...args: any[]) => any }
  ) {
    const componentName = currentNode.value.componentName;
    const res = components[componentName] || (() => 'Component not found');
    return res;
  }

  pageRender(
    pageModel: CPage,
    { runtimeHelper, components }: AdapterOptionsType
  ) {
    //做一些全局 store 操作
    const rootNode = pageModel.value.componentsTree;
    const component = this.getComponent(rootNode, components);
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

  convertModelToComponent(
    originalComponent: any,
    nodeModal: CNode | CSchema,
    pageModel: CPage,
    options: AdapterOptionsType
  ) {
    return (props: Record<any, any>) => {
      // handle props
      const newProps: Record<any, any> = { ...props };
      const children: any[] = [];
      console.log(
        '🚀 ~ file: adapter-react.ts ~ line 62 ~ DefineReactAdapter ~ return ~ newProps',
        newProps
      );
      // handle children
      return this.componentRender(originalComponent, newProps, ...children);
    };
  }
}
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const ReactAdapter = getAdapter(new DefineReactAdapter());
