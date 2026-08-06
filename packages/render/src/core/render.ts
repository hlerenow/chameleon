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
  /** Page 运行时从外部传入的 props，外部值覆盖页面 schema 中同名 props */
  pageProps?: Record<string, any>;
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
  adapter: AdapterType;
  ownsAdapter: boolean;
  refManager: RefManager;
  // save component instance
  dynamicComponentInstanceMap = new Map<string, RenderInstance>();
  constructor(props: RenderPropsType) {
    super(props);
    const runtimeAdapter = props.adapter.createInstance?.();
    this.adapter = runtimeAdapter || props.adapter;
    this.ownsAdapter = Boolean(runtimeAdapter);
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
    if (this.ownsAdapter) {
      this.adapter.clear();
    }
  }

  onGetRef: AdapterOptionType['onGetRef'] = (ref, nodeModel, instance) => {
    this.props.onGetRef?.(ref, nodeModel, instance);
    this.dynamicComponentInstanceMap.set(nodeModel.id, instance);
    this.refManager.add(nodeModel.value.refId || nodeModel.id, ref);
  };

  render() {
    const { props } = this;
    const { onGetComponent, onComponentDestroy, onComponentMount } = props;
    const { adapter } = this;
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
    let newDoc = this.props.doc;
    if (typeof window !== 'undefined') {
      newDoc = this.props.doc || window.document;
    }
    const PageRoot = adapter.pageRender(pageModel, {
      libs: {},
      components: finalComponents,
      pageProps: props.pageProps,
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
      doc: newDoc!,
    });

    return PageRoot;
  }

  getPageStorage = () => {
    return this.adapter.getPageStorage?.() || {};
  };

  updatePageStorage = (newState: Record<any, any>) => {
    this.adapter.updatePageStorage?.(newState);
  };

  rerender = (newPage?: CPageDataType | CPage, options?: { force?: boolean }) => {
    const force = options?.force ?? false;
    if ((newPage as CPage)?.nodeType === 'PAGE' && newPage) {
      this.adapter.clear({ preserveState: !force });
      this.setState({
        pageModel: newPage as CPage,
      });
    } else if (isPlainObject(newPage) && checkPage(newPage)) {
      const newP = newPage as CPageDataType;
      this.adapter.clear({ preserveState: !force });
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
  /** options.force 为 true 时清空运行时状态并完整重建页面。 */
  rerender: (newPage: CPageDataType, options?: { force?: boolean }) => void;
  getPageStorage: () => Record<any, any>;
  updatePageStorage: (newState: Record<any, any>) => void;
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
      getPageStorage: function () {
        return ref.current?.getPageStorage() || {};
      },
      updatePageStorage: function (newState) {
        ref.current?.updatePageStorage(newState);
      },
    };
  }, []);

  return res;
};

export * from './type';
