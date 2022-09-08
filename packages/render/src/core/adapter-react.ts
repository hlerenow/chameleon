import { CPage } from '@chameleon/model';
import { AdapterType, getAdapter } from './adapter';

class DefineReactAdapter implements Partial<AdapterType> {
  pageRender(pageModel: CPage, options: { libs: Record<string, any> }) {
    return 1;
  }
}
console.log(new DefineReactAdapter());
export const ReactAdapter = getAdapter(DefineReactAdapter);
