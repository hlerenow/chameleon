import React from 'react';
import { htmlTagNames } from 'html-tag-names';
import { CMaterialType } from '@chameleon/model';
import { capitalize } from 'lodash-es';

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

const htmlNativeComponentMeta = HTMl_TAGS.map((tag) => {
  const DivMeta: CMaterialType = {
    title: capitalize(tag),
    componentName: tag,
    npm: false,
    icon: '',
    props: [
      {
        name: 'style',
        title: '样式',
        valueType: 'object',
        setters: ['JSONSetter'],
      },
      {
        name: 'className',
        title: '类名',
        valueType: 'string',
        setters: ['StringSetter'],
      },
    ],
    snippets: [
      {
        title: `${capitalize(tag)}`,
        snapshotText: tag,
        category: 'HTML 元素',
        schema: {
          props: {},
          children: [`I am a ${tag}`],
        },
      },
    ],
  };

  return DivMeta;
});

// 内置物料组件
export const InnerComponent = {
  CPage: ({ children }: any) => {
    return children;
  },
  ...htmlNativeComponents,
};

export const InnerComponentMeta = htmlNativeComponentMeta;
