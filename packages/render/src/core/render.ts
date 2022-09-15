import { CPageDataType, parseModel } from '@chameleon/model';
import { AdapterType, getRuntimeRenderHelper } from './adapter';

export type RenderPropsType = {
  page: CPageDataType;
  components?: Record<any, (...args: any) => any>;
};

export const getRenderComponent = (adapter: AdapterType) => {
  return function Render(props: RenderPropsType): any {
    const pageModel = parseModel(props.page);
    // todo: 加载 page 资源
    // todo: 收集所有的 第三方库

    const PageRoot = adapter.pageRender(pageModel, {
      libs: {},
      runtimeHelper: getRuntimeRenderHelper(pageModel, adapter, {
        libs: {},
      }),
    });

    return PageRoot;
  };
};
