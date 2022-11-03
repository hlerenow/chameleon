import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import styles from './style.module.scss';
import ReactDOM from 'react-dom';
import { isDOM } from '../../utils';
import { DesignRenderInstance } from '@chameleon/render';

export type HighlightBoxPropsType = {
  instance: DesignRenderInstance;
  toolRender?: React.ReactNode;
};

export const HighlightBox = ({
  instance,
  toolRender,
}: HighlightBoxPropsType) => {
  let instanceDom: HTMLElement | null = null;
  // eslint-disable-next-line react/no-find-dom-node
  const dom = ReactDOM.findDOMNode(instance);
  const [toolBoxSize, setToolBoxSize] = useState({
    width: 0,
    height: 0,
  });
  console.log('🚀 ~ file: index.tsx ~ line 23 ~ toolBoxSize', toolBoxSize);
  const toolBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toolBoxDom = toolBoxRef.current;
    if (!toolBoxDom) {
      return;
    }
    const resizeObserver = new ResizeObserver((e) => {
      console.log(e);
      setToolBoxSize({
        width: e[0].contentRect.width,
        height: e[0].contentRect.height,
      });
    });
    resizeObserver.observe(toolBoxDom);
    () => {
      console.log('销毁');
      resizeObserver.disconnect();
    };
  }, []);
  if (!dom) {
    return <></>;
  }
  if (isDOM(dom)) {
    instanceDom = dom as unknown as HTMLElement;
  }

  const rect = instanceDom?.getBoundingClientRect();

  if (!rect) {
    return <></>;
  }
  const styleObj = {
    width: rect?.width + 'px',
    height: rect?.height + 'px',
    left: rect?.left + 'px',
    top: rect?.top + 'px',
  };

  return (
    <div className={styles.highlightBox} style={styleObj}>
      <div
        ref={toolBoxRef}
        className={styles.toolBox}
        style={{
          top: `-${toolBoxSize.height + 5}px`,
          opacity: toolBoxSize.width ? 1 : 0,
        }}
      >
        {toolRender}
      </div>
    </div>
  );
};

export type HighlightCanvasRefType = {
  update: () => void;
};

export const HighlightCanvasCore = (
  {
    instances,
    toolRender,
  }: {
    instances: DesignRenderInstance[];
    toolRender?: React.ReactNode;
  },
  ref: React.Ref<HighlightCanvasRefType>
) => {
  const [_, updateRender] = useState(0);
  useImperativeHandle(
    ref,
    () => {
      return {
        update() {
          updateRender(_ + 1);
        },
      };
    },
    [updateRender]
  );
  return (
    <div className={styles.borderDrawBox}>
      {instances.map((el) => {
        return (
          <HighlightBox
            key={el?._NODE_ID}
            instance={el}
            toolRender={toolRender}
          />
        );
      })}
    </div>
  );
};

export const HighlightCanvas = React.forwardRef(HighlightCanvasCore);
