import { CPageDataType } from '@chamn/model';
import { ReactAdapter, Render, useRender } from '@chamn/render';
import { BasicComponentProps } from '../../types';
import { LayoutProvider } from './layoutCtx';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadLayoutAssets } from './helper';

export type CLoadLayoutType = BasicComponentProps & {
  isContainer?: boolean;
  fragmentSchema: CPageDataType;
  COMPONENTS: any;
  doc?: Document;
};

export const CFragment = (props: CLoadLayoutType) => {
  const [isReady, setIsReady] = useState(false);
  const { fragmentSchema = {} as any, COMPONENTS } = props;
  const [layoutComponents, setLayoutComponents] = useState<Record<any, any>>(
    {}
  );
  const renderHandle = useRender();
  const [ctx, setCtx] = useState({ slotMap: {} });

  const { slotProps } = useMemo(() => {
    const {
      children,
      fragmentSchema = {} as any,
      COMPONENTS,
      ...restProps
    } = props;
    const slotProps: any = {};
    const newProps: any = {};
    Object.keys(restProps).forEach((k) => {
      if (k.startsWith('_slot_')) {
        slotProps[k] = (restProps as any)[k];
      } else {
        newProps[k] = (restProps as any)[k];
      }
    });
    return {
      slotProps,
      newProps,
    };
  }, [props]);

  const toLoadAssets = useCallback(async () => {
    const tempMap = await loadLayoutAssets(fragmentSchema);
    setLayoutComponents(tempMap);
    setIsReady(true);
  }, [fragmentSchema]);

  useEffect(() => {
    toLoadAssets();
  }, []);

  const componentMap = useMemo(() => {
    return {
      ...COMPONENTS,
      ...layoutComponents,
    };
  }, [COMPONENTS, layoutComponents]);

  // 添加一个用于生成唯一 key 的 state
  const [canRender, setCanRender] = useState(true);

  useEffect(() => {
    setCtx({
      ...ctx,
      slotMap: slotProps,
    });
    setCanRender(false);
    setTimeout(() => {
      setCanRender(true);
    });
  }, [slotProps]);
  if (!isReady) {
    return <>Loading ...</>;
  }

  return (
    <LayoutProvider value={ctx}>
      <div>
        {canRender && (
          <Render
            page={fragmentSchema}
            components={componentMap}
            render={renderHandle}
            adapter={ReactAdapter}
            doc={props.doc}
            renderMode={'design'}
          />
        )}
      </div>
    </LayoutProvider>
  );
};
