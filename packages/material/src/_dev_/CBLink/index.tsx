import { useEffect } from 'react';
import { BasicComponentProps } from '../../types';

export type CBLinkPropsType = BasicComponentProps & {
  text?: string;
  isContainer?: boolean;
  width?: number;
  height?: number;
  url?: string;
  pageKey?: string;
  isDesigner?: boolean;
  onJump?: (url: string) => void;
  preloadPage?: boolean;
};
export const CBLink = (props: CBLinkPropsType) => {
  const { children, style = {}, text, width, height, isDesigner } = props;
  const specialStyle: React.CSSProperties = {};
  if (width) {
    specialStyle['width'] = `${width}px`;
  }
  if (height) {
    specialStyle['height'] = `${height}px`;
  }
  const url = props.url || props.pageKey || '#';
  useEffect(() => {
    if (props.preloadPage) {
      // 提前请求页面数据
    }
  }, []);

  return (
    <a
      style={{
        textDecoration: 'none',
        display: 'inline-block',
        userSelect: 'none',
        ...{ WebkitUserDrag: 'none' },
        ...style,
        ...specialStyle,
      }}
      href={url}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (props.pageKey) {
          // TODO: 调用框架提供的跳转函数
          // 先调用 API 获取，然后直接重新渲染 schema 替换，现有 dom
          // 结束
        }
        props.onJump?.(url);
        // url 使用全路径，不能使用相对路径
        if (isDesigner) {
          return;
        }
        location.href = url;
      }}
      data-page-key={props.pageKey}
    >
      {children && children}
      {!children && text}
    </a>
  );
};
