import { CPage, CPageDataType, parsePageModel } from '@chameleon/model';
import React, { useRef } from 'react';
import { AdapterOptionType, AdapterType } from './adapter';
import { runtimeComponentCache } from './adapterReact';
import { RefManager } from './refManager';

export type RenderPropsType = {
  page?: CPageDataType;
  pageModel?: CPage;
  adapter: AdapterType;
  render: UseRenderReturnType;
} & Partial<AdapterOptionType>;

export class Render extends React.Component<
  RenderPropsType,
  {
    pageModel: CPage | null;
  }
> {
  refManager: RefManager;
  constructor(props: RenderPropsType) {
    super(props);
    this.state = {
      pageModel: props.pageModel || parsePageModel(props.page),
    };
    this.refManager = new RefManager();
  }

  componentDidMount(): void {
    const { render } = this.props;
    if (render) {
      render.ref.current = this;
    }
    console.log(this);
  }

  componentWillUnmount(): void {
    this.refManager.destroy();
  }

  rerender = (newPage: CPageDataType) => {
    runtimeComponentCache.clear();
    this.setState({
      pageModel: parsePageModel(newPage),
    });
    // 触发 model 变化
    this.state.pageModel?.emitter.emit('onNodeChange', {
      value: newPage as any,
      preValue: this.state.pageModel as any,
      node: this.state.pageModel as any,
    });
  };

  onGetRef: AdapterOptionType['onGetRef'] = (ref, nodeModel, instance) => {
    this.props.onGetRef?.(ref, nodeModel, instance);
    this.refManager.add(nodeModel.value.refId || nodeModel.id, ref);
  };

  render() {
    const { props } = this;
    const { adapter, onGetComponent } = props;
    const { pageModel } = this.state;
    // todo: 加载 page 资源
    // todo: 收集所有的 第三方库
    if (!pageModel) {
      return null;
    }
    const PageRoot = adapter.pageRender(pageModel, {
      libs: {},
      components: props.components || {},
      onGetRef: this.onGetRef,
      onGetComponent,
      $$context: {
        refs: this.refManager,
      },
    });

    return PageRoot;
  }
}

export type UseRenderReturnType = {
  ref: React.MutableRefObject<Render | null>;
  rerender: (newPage: CPageDataType) => void;
};

export const useRender = (): UseRenderReturnType => {
  const ref = useRef<Render>(null);

  return {
    ref: ref,
    rerender: function (...args) {
      if (ref.current) {
        ref.current.rerender(...args);
      }
    },
  };
};
