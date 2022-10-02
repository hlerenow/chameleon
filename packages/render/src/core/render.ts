import { CPage, CPageDataType, parseModel } from '@chameleon/model';
import React, { useRef } from 'react';
import { AdapterOptionType, AdapterType } from './adapter';
import { runtimeComponentCache } from './adapterReact';
import { RefManager } from './refManager';

export type RenderPropsType = {
  page: CPageDataType;
  components: Record<any, any>;
  render: UseRenderReturnType;
  adapter: AdapterType;
  onGetRef?: AdapterOptionType['onGetRef'];
};

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
      pageModel: parseModel(props.page),
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
      pageModel: parseModel(newPage),
    });
    // 触发 model 变化
    this.state.pageModel?.emitter.emit('onNodeChange', {
      value: newPage as any,
      preValue: this.state.pageModel as any,
      node: this.state.pageModel as any,
    });
  };

  onGetRef: AdapterOptionType['onGetRef'] = (ref, nodeModel) => {
    this.props.onGetRef?.(ref, nodeModel);
    this.refManager.add(nodeModel.id, ref);
  };

  render() {
    const { props } = this;
    const { adapter } = props;
    const { pageModel } = this.state;
    // todo: 加载 page 资源
    // todo: 收集所有的 第三方库
    if (!pageModel) {
      return null;
    }
    const PageRoot = adapter.pageRender(pageModel, {
      libs: {},
      components: props.components,
      onGetRef: this.onGetRef,
      $$context: {
        refs: this.refManager,
      },
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
