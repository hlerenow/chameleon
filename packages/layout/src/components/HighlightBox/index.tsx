import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import styles from './style.module.scss';
import ReactDOM from 'react-dom';
import { animationFrame, isDOM } from '../../utils';
import { DesignRenderInstance } from '@chameleon/render';

export type HighlightCanvasRefType = {
  update: () => void;
};

export type HighlightBoxPropsType = {
  instance: DesignRenderInstance;
  toolRender?: React.ReactNode;
  style?: React.CSSProperties;
  getRef?: (ref: React.RefObject<HighlightCanvasRefType>) => void;
  onRefDestroy?: (ref: React.RefObject<HighlightCanvasRefType>) => void;
};

export const HighlightBox = ({
  instance,
  toolRender,
  getRef,
  onRefDestroy,
  style,
}: HighlightBoxPropsType) => {
  const [styleObj, setStyleObj] = useState<Record<string, string>>({});
  const [rect, setRect] = useState<DOMRect>();
  const ref = useRef<HighlightCanvasRefType>(null);

  const toolBoxRef = useRef<HTMLDivElement>(null);
  const [targetDom, setTargetDom] = useState<HTMLElement>();
  const instanceRef = useRef<DesignRenderInstance>();
  instanceRef.current = instance;
  useEffect(() => {
    getRef?.(ref);
    if (instance?._STATUS === 'DESTROY') {
      return;
    }
    // eslint-disable-next-line react/no-find-dom-node
    const dom = ReactDOM.findDOMNode(instance);
    if (isDOM(dom)) {
      setTargetDom(dom as unknown as HTMLElement);
    }
    return () => {
      onRefDestroy?.(ref);
    };
  }, []);

  useEffect(() => {
    const handle = animationFrame(() => {
      updatePos();
    });

    return () => {
      handle();
    };
  }, []);

  const updatePos = useCallback(() => {
    const tempInstance = instanceRef.current;
    let instanceDom: HTMLElement | null = null;
    if (tempInstance?._STATUS === 'DESTROY') {
      return;
    }

    // eslint-disable-next-line react/no-find-dom-node
    const dom = ReactDOM.findDOMNode(tempInstance);
    if (isDOM(dom)) {
      instanceDom = dom as unknown as HTMLElement;
      setTargetDom(instanceDom);
    } else {
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
    const toolBoxDom = document.getElementById(tempInstance?._UNIQUE_ID || '');
    if (toolBoxDom) {
      toolBoxDom.style.transform = transformStr;
      toolBoxDom.style.width = tempRect?.width + 'px';
      toolBoxDom.style.height = tempRect?.height + 'px';
    }
    setStyleObj(tempObj);
  }, []);

  useEffect(() => {
    updatePos();
  }, [instance]);

  (ref as any).current = {
    update() {
      updatePos();
    },
  };

  if (!targetDom || !instance) {
    return <></>;
  }
  return (
    <div
      className={styles.highlightBox}
      id={instance?._UNIQUE_ID}
      style={{
        ...style,
        ...styleObj,
        opacity: rect ? 1 : 0,
      }}
    >
      {toolRender && (
        <div ref={toolBoxRef} className={styles.toolBox}>
          {toolRender}
        </div>
      )}
    </div>
  );
};

export const HighlightCanvasCore = (
  {
    instances,
    toolRender,
    style,
  }: {
    instances: DesignRenderInstance[];
    toolRender?: React.ReactNode;
    style?: React.CSSProperties;
  },
  ref: React.Ref<HighlightCanvasRefType>
) => {
  const allBoxRef = useRef<React.RefObject<HighlightCanvasRefType>[]>([]);
  useImperativeHandle(
    ref,
    () => {
      return {
        update() {
          // 更新所有的高亮框位置
          allBoxRef.current.forEach((el) => {
            el.current?.update();
          });
        },
      };
    },
    []
  );
  const onRefDestroy = (ref: React.RefObject<HighlightCanvasRefType>) => {
    const list = allBoxRef.current || [];
    allBoxRef.current = list.filter((el) => el !== ref);
  };

  return (
    <div className={styles.borderDrawBox}>
      {instances.map((el) => {
        if (!el || el._STATUS === 'DESTROY') {
          return null;
        }
        return (
          <HighlightBox
            style={style}
            key={el?._UNIQUE_ID}
            instance={el}
            toolRender={toolRender}
            getRef={(ref) => {
              if (ref.current) {
                allBoxRef.current.push(ref);
              }
            }}
            onRefDestroy={onRefDestroy}
          />
        );
      })}
    </div>
  );
};

export const HighlightCanvas = React.forwardRef(HighlightCanvasCore);
