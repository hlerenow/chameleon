import { CPage, CPageDataType, parseModel } from '@chameleon/model';
import React from 'react';
import { AdapterType, getRuntimeRenderHelper } from './adapter';

export type RenderPropsType = {
  page: CPageDataType;
  components: Record<any, any>;
};

export const getRenderComponent = (adapter: AdapterType) => {
  return class Render extends React.Component<
    RenderPropsType,
    {
      pageModel: CPage;
    }
  > {
    constructor(props: RenderPropsType) {
      super(props);
      this.state = {
        pageModel: parseModel(props.page),
      };

      console.log(this);
    }

    render() {
      const { props } = this;
      const { pageModel } = this.state;
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
    }
  };
};
