import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import styles from './style.module.scss';
import ReactDOM from 'react-dom';
import { isDOM } from '../../utils';
import { DesignRenderInstance } from '@chameleon/render';

export type HighlightCanvasRefType = {
  update: () => void;
};

export type HighlightBoxPropsType = {
  instance: DesignRenderInstance;
  toolRender?: React.ReactNode;
  getRef?: (ref: React.RefObject<HighlightCanvasRefType>) => void;
};

export const HighlightBox = ({
  instance,
  toolRender,
  getRef,
}: HighlightBoxPropsType) => {
  let instanceDom: HTMLElement | null = null;
  // eslint-disable-next-line react/no-find-dom-node
  const dom = ReactDOM.findDOMNode(instance);
  const [styleObj, setStyleObj] = useState<Record<string, string>>({});
  const [rect, setRect] = useState<DOMRect>();
  const ref = useRef<HighlightCanvasRefType>(null);
  const [toolBoxSize, setToolBoxSize] = useState({
    width: 0,
    height: 0,
  });
  const toolBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getRef?.(ref);
  }, []);
  useEffect(() => {
    const toolBoxDom = toolBoxRef.current;
    if (!toolBoxDom) {
      return;
    }
    const resizeObserver = new ResizeObserver((e) => {
      setToolBoxSize({
        width: e[0].contentRect.width,
        height: e[0].contentRect.height,
      });
    });
    resizeObserver.observe(toolBoxDom);
    () => {
      resizeObserver.disconnect();
    };
  }, []);

  if (!dom) {
    return <></>;
  }
  if (isDOM(dom)) {
    instanceDom = dom as unknown as HTMLElement;
  }
  const updatePos = useCallback(() => {
    if (!instanceDom) {
      return;
    }
    const tempRect = instanceDom.getBoundingClientRect();
    setRect(tempRect);
    const transformStr = `translate3d(${tempRect?.left}px, ${tempRect.top}px, 0)`;
    const tempObj = {
      width: tempRect?.width + 'px',
      height: tempRect?.height + 'px',
      transform: transformStr,
    };
    const toolBoxDom = document.getElementById(instance?._UNIQUE_ID || '');
    if (toolBoxDom) {
      toolBoxDom.style.transform = transformStr;
      toolBoxDom.style.width = tempRect?.width + 'px';
      toolBoxDom.style.height = tempRect?.height + 'px';
    }
    setStyleObj(tempObj);
  }, [instanceDom]);

  useEffect(() => {
    updatePos();
  }, []);

  (ref as any).current = {
    update() {
      updatePos();
    },
  };

  return (
    <div
      className={styles.highlightBox}
      id={instance?._UNIQUE_ID}
      style={{
        opacity: rect ? 1 : 0,
      }}
    >
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
  const allBoxRef = useRef<React.RefObject<HighlightCanvasRefType>[]>([]);
  useImperativeHandle(
    ref,
    () => {
      return {
        update() {
          updateRender(_ + 1);
          // 更新所有的高亮框位置
          allBoxRef.current.forEach((el) => {
            el.current?.update();
          });
        },
      };
    },
    [updateRender, _]
  );

  return (
    <div className={styles.borderDrawBox}>
      {instances.map((el) => {
        if (!el) {
          return null;
        }
        return (
          <HighlightBox
            key={el?._UNIQUE_ID}
            instance={el}
            toolRender={toolRender}
            getRef={(ref) => {
              if (ref.current) {
                allBoxRef.current.push(ref);
              }
            }}
          />
        );
      })}
    </div>
  );
};

export const HighlightCanvas = React.forwardRef(HighlightCanvasCore);
