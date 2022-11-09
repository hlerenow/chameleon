import React, { RefObject, useEffect, useRef, useState } from 'react';
import { animationFrame } from '../../utils';
import {
  HighlightBox,
  HighlightBoxPropsType,
  HighlightCanvasRefType,
} from '../HighlightBox';

export const HighlightHoverCanvas = ({ instance }: HighlightBoxPropsType) => {
  const ref = useRef<RefObject<HighlightCanvasRefType>>();
  useEffect(() => {
    const handler = animationFrame(() => {
      ref?.current?.current?.update();
    });
    return () => {
      handler();
    };
  }, []);
  return (
    <HighlightBox
      key={'hover-box'}
      getRef={(r) => {
        ref.current = r;
      }}
      instance={instance}
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        left: 0,
        top: 0,
        border: '1px dashed rgba(0,0,255, .8)',
      }}
    />
  );
};
