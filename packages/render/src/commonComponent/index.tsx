import React from 'react';
import { htmlTagNames } from 'html-tag-names';

const HTMl_TAGS = htmlTagNames;

const htmlNativeComponents = HTMl_TAGS.reduce((res, tag) => {
  res[tag] = ({ children, ...props }: any) => {
    let child = children;
    if (!Array.isArray(children)) {
      child = [children];
    }
    return React.createElement(tag, props, ...child);
  };
  return res;
}, {} as Record<string, (props: any) => React.ReactNode>);

// 内置物料组件
export const InnerComponent = {
  Page: ({ children }: any) => {
    return children;
  },
  ...htmlNativeComponents,
};
