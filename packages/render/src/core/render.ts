import { CPage, CPageDataType, parseModel } from '@chameleon/model';
import React, { Ref, useRef } from 'react';
import { AdapterType } from './adapter';
import { runtimeComponentCache } from './adapter-react';

export type RenderPropsType = {
  page: CPageDataType;
  components: Record<any, any>;
  render: UseRenderReturnType;
  adapter: AdapterType;
};

export class Render extends React.Component<
  RenderPropsType,
  {
    pageModel: CPage | null;
  }
> {
  // static getDerivedStateFromProps(props: RenderPropsType) {
  //   return {
  //     pageModel: parseModel(props.page),
  //   };
  // }
  constructor(props: RenderPropsType) {
    super(props);
    this.state = {
      pageModel: parseModel(props.page),
    };
  }

  componentDidMount(): void {
    const { render } = this.props;
    if (render) {
      render.ref.current = this;
    }
  }

  rerender(newPage: CPageDataType) {
    console.log('🚀 ~ file: render.ts ~ line 32 ~ rerender ~ newPage', newPage);
    runtimeComponentCache.clear();
    this.setState({
      pageModel: parseModel(newPage),
    });
    this.state.pageModel?.emitter.emit('onNodeChange', {
      value: newPage as any,
      preValue: this.state.pageModel as any,
      node: this.state.pageModel as any,
    });
  }

  render() {
    const { props } = this;
    const { adapter } = props;
    const { pageModel } = this.state;
    // todo: 加载 page 资源
    // todo: 收集所有的 第三方库
    if (!pageModel) {
      return null;
    }
    console.log('Root update', pageModel);
    const PageRoot = adapter.pageRender(pageModel, {
      libs: {},
      components: props.components,
    });

    return PageRoot;
  }
}

export type UseRenderReturnType = {
  ref: React.MutableRefObject<any>;
  rerender: (newPage: CPageDataType | CPage) => void;
};

export const useRender = (): UseRenderReturnType => {
  const ref = useRef<any>();

  return {
    ref: ref,
    rerender: function (...args) {
      if (ref.current) {
        ref.current.rerender(...args);
      }
    },
  };
};
