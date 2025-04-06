import { CSSSizeInputProps } from '@/component/CSSSizeInput';
import { CSetter, CSetterProps } from '../type';
import { StyleUIPanel, StyleUIPanelRef } from '@/component/StylePanel';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { formatStyleProperty, styleArr2Obj, styleObjToArr } from '@/utils';
import { CNode, CRootNode } from '@chamn/model';
import { isEqual } from 'lodash-es';

export const FastLayoutSetter: CSetter<CSSSizeInputProps> = ({
  value,
  setterContext,
  initialValue,
  ...resetProps
}: CSetterProps<CSSSizeInputProps & { initialValue?: string }>) => {
  const cssUIRef = useRef<StyleUIPanelRef>(null);
  const node = setterContext.nodeModel;
  const lastNode = useRef<CNode | CRootNode>();

  const initialValueInner = useMemo(() => {
    const newStyle = node.value.style || [];
    const { normalProperty } = formatStyleProperty(newStyle);
    return styleArr2Obj(normalProperty);
  }, [node.value.style]);

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
