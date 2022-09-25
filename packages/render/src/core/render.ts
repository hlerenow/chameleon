import { CPageDataType, parseModel } from '@chameleon/model';
import { AdapterType, getRuntimeRenderHelper } from './adapter';

export type RenderPropsType = {
  page: CPageDataType;
  components: Record<any, any>;
};

export const getRenderComponent = (adapter: AdapterType) => {
  return function Render(props: RenderPropsType): any {
    const pageModel = parseModel(props.page);
    console.log(
      '🚀 ~ file: render.ts ~ line 12 ~ Render ~ pageModel',
      pageModel
    );
    // todo: 加载 page 资源
    // todo: 收集所有的 第三方库
    const PageRoot = adapter.pageRender(pageModel, {
      libs: {},
      runtimeHelper: getRuntimeRenderHelper(pageModel, adapter, {
        libs: {},
        components: props.components,
      }),
      components: props.components,
    });

    return PageRoot;
  };
};
