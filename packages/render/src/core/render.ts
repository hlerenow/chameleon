import { checkPage, CPage, CPageDataType } from '@chamn/model';
import { isPlainObject } from 'lodash-es';
import React, { useMemo, useRef } from 'react';
import { InnerComponent } from '../commonComponent';
import { AdapterOptionType, AdapterType } from './adapter';
import { RefManager } from './refManager';
import { RenderInstance } from './type';

export type RenderPropsType = {
  page?: CPageDataType;
  pageModel?: CPage;
  adapter: AdapterType;
  render?: UseRenderReturnType;
  ref?: React.MutableRefObject<Render | null>;
  renderMode?: 'design' | 'normal';
  doc?: Document;
} & Partial<AdapterOptionType>;

export class Render extends React.Component<
  RenderPropsType,
  {
    pageModel: CPage;
  }
> {
  refManager: RefManager;
  // save component instance
  dynamicComponentInstanceMap = new Map<string, RenderInstance>();
  constructor(props: RenderPropsType) {
    super(props);
    this.state = {
      pageModel: props.pageModel || new CPage(props.page!),
    };
    this.refManager = new RefManager();
  }

  getPageModel() {
    return this.state.pageModel;
  }

  componentDidMount(): void {
    const { render } = this.props;
    if (render) {
      render.ref.current = this;
    }

    // 将当前 window 暴露给
    if (window.parent) {
      (window.parent as any).__CB_RENDER_WIN__ = window;
    }
  }

  componentWillUnmount(): void {
    this.refManager.destroy();
  }

  onGetRef: AdapterOptionType['onGetRef'] = (ref, nodeModel, instance) => {
    this.props.onGetRef?.(ref, nodeModel, instance);
    this.dynamicComponentInstanceMap.set(nodeModel.id, instance);
    this.refManager.add(nodeModel.value.refId || nodeModel.id, ref);
  };

  render() {
    const { props } = this;
    const { adapter, onGetComponent, onComponentDestroy, onComponentMount, doc } = props;
    const { pageModel } = this.state;
    // todo: 加载 page 资源
    // todo: 收集所有的 第三方库
    if (!pageModel) {
      console.warn('pageModel is null');
      return null;
    }
    const finalComponents = {
      ...InnerComponent,
      ...props.components,
    };

    const $$context: any = this.props.$$context || {};
    const PageRoot = adapter.pageRender(pageModel, {
      libs: {},
      components: finalComponents,
      refManager: this.refManager,
      onGetRef: this.onGetRef,
      onGetComponent,
      onComponentMount,
      onComponentDestroy,
      $$context: {
        ...$$context,
        nodeRefs: this.refManager,
      },
      renderMode: props.renderMode || 'normal',
      requestAPI: props.requestAPI ?? adapter.requestAPI,
      processNodeConfigHook: props.processNodeConfigHook,
      doc: doc || document,
    });

    return PageRoot;
  }

  rerender = (newPage?: CPageDataType | CPage) => {
    this.props.adapter.clear();
    if ((newPage as CPage)?.nodeType === 'PAGE' && newPage) {
      this.setState({
        pageModel: newPage as CPage,
      });
    } else if (isPlainObject(newPage) && checkPage(newPage)) {
      const newP = newPage as CPageDataType;
      this.setState({
        pageModel: new CPage(newP, {
          materials: this.state.pageModel.materialsModel.rawValue,
        }),
      });
    }
  };
}

export type UseRenderReturnType = {
  ref: React.MutableRefObject<Render | null>;
  rerender: (newPage: CPageDataType) => void;
};

export const useRender = (): UseRenderReturnType => {
  const ref = useRef<Render>(null);

  const res = useMemo<UseRenderReturnType>(() => {
    return {
      ref: ref,
      rerender: function (...args) {
        if (ref.current) {
          ref.current.rerender(...args);
        }
      },
    };
  }, []);

  return res;
};

export * from './type';
