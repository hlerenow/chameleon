import { CNode, CPage, CSchema } from '@chameleon/model';
import { AdapterOptionsType, AdapterType, getAdapter } from './adapter';

class DefineReactAdapter implements Partial<AdapterType> {
  pageRender(pageModel: CPage, options: AdapterOptionsType) {
    //做一些全局 store 操作
    return options.runtimeHelper.renderComponent();
  }

  componentRender(
    originalComponent: any,
    nodeModal: CNode | CSchema,
    pageModel: CPage
  ) {
    return 1;
  }
}
console.log(new DefineReactAdapter());
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const ReactAdapter = getAdapter(new DefineReactAdapter());
