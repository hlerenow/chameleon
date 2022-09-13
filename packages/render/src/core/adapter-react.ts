import { CPage } from '@chameleon/model';
import { AdapterOptionsType, AdapterType, getAdapter } from './adapter';

class DefineReactAdapter implements Partial<AdapterType> {
  pageRender(pageModel: CPage, options: AdapterOptionsType) {
    //做一些全局 store 操作
    return options.runtimeHelper.renderComponent();
  }
}
console.log(new DefineReactAdapter());
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const ReactAdapter = getAdapter(new DefineReactAdapter());
