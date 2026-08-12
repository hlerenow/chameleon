import { CSSSizeInputProps } from '@/component/CSSSizeInput';
import { CSetter, CSetterProps } from '../type';
import { StyleUIPanel, StyleUIPanelRef } from '@/component/StylePanel';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatStyleProperty, styleArr2Obj, styleObjToArr } from '@/utils';
import { CNode, CRootNode } from '@chamn/model';
import { isEqual } from 'lodash-es';
import { DesignerPluginInstance } from '@/plugins/Designer/type';

export const FastLayoutSetter: CSetter<CSSSizeInputProps> = ({
  value,
  setterContext,
  initialValue,
  ...resetProps
}: CSetterProps<CSSSizeInputProps & { initialValue?: string }>) => {
  const cssUIRef = useRef<StyleUIPanelRef>(null);
  const node = setterContext.nodeModel;
  const [visualSizeDom, setVisualSizeDom] = useState<HTMLElement | null>(null);
  const lastNode = useRef<CNode | CRootNode>();

  const initialValueInner = (() => {
    const newStyle = node.value.style || [];
    const { normalProperty } = formatStyleProperty(newStyle);
    return styleArr2Obj(normalProperty);
  })();

  useEffect(() => {
    let disposed = false;
    let timer: number | undefined;
    const findDom = async () => {
      const designer = await setterContext.pluginCtx.pluginManager.get<DesignerPluginInstance>('Designer');
      const dom = designer?.export.getComponentInstances(node.id)?.[0]?.getDom?.();
      if (disposed) return;
      if (dom) {
        setVisualSizeDom(dom as HTMLElement);
        return;
      }
      timer = window.setTimeout(findDom, 50);
    };
    findDom();
    return () => {
      disposed = true;
      if (timer) window.clearTimeout(timer);
      setVisualSizeDom(null);
    };
  }, [node, setterContext.pluginCtx.pluginManager]);

  const updatePanelValue = useCallback(() => {
    lastNode.current = node;
    const newStyle = node.value.style || [];
    const { normalProperty } = formatStyleProperty(newStyle);
    cssUIRef.current?.setValue(styleArr2Obj(normalProperty) || {});
  }, [node]);

  useEffect(() => {
    updatePanelValue();
    node.emitter.on('onNodeChange', updatePanelValue);
    node.emitter.on('onReloadPage', updatePanelValue);
    return () => {
      node.emitter.off('onNodeChange', updatePanelValue);
      node.emitter.off('onReloadPage', updatePanelValue);
    };
  }, [node.emitter, node.id, updatePanelValue]);

  return (
    <StyleUIPanel
      {...resetProps}
      initialVal={initialValueInner}
      visualSizeDom={visualSizeDom}
      ref={cssUIRef}
      onValueChange={(newNormaCss) => {
        const newStyle = styleObjToArr(newNormaCss);
        const { expressionProperty } = formatStyleProperty(node.value.style || []);
        const newStyleList = [...newStyle, ...expressionProperty];
        if (isEqual(node.value.style, newStyleList)) {
          return;
        }
        node.value.style = newStyleList;
        node.updateValue();
      }}
    />
  );
};
