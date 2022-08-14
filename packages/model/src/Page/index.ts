import {
  any,
  array,
  assign,
  boolean,
  literal,
  object,
  optional,
  string,
  union,
} from 'superstruct';
import { checkSchema, CSchema } from '../Schema';
import { checkComplexData } from '../util/dataCheck';

export type LibMetaType = {
  componentName: string;
  package: string;
  version: string;
  exportName: string;
  destructuring?: boolean;
  subName?: string;
  main?: string;
};

export type ComponentMetaType = {
  componentName: string;
} & LibMetaType;

const LibMetaTypeDescribe = object({
  package: string(),
  version: string(),
  exportName: string(),
  destructuring: optional(boolean()),
  subName: optional(string()),
  main: optional(string()),
});

export enum ThirdLibTypeEnum {
  CDN = 'CDN',
  FUNCTION = 'FUNCTION',
}

export type ThirdLibType =
  | {
      globalName: string;
      type: ThirdLibTypeEnum.CDN;
      content: LibMetaType;
    }
  | {
      globalName: string;
      type: ThirdLibTypeEnum.FUNCTION;
      content: string;
    };

const ThirdLibTypeDescribe = union([
  object({
    globName: string(),
    type: literal([ThirdLibTypeEnum.CDN]),
    content: union([LibMetaTypeDescribe]),
  }),
  object({
    globName: string(),
    type: literal([ThirdLibTypeEnum.FUNCTION]),
    content: union([string()]),
  }),
]);

export type CPageDataType = {
  version: string;
  pageName: string;
  style?: string;
  css?: {
    type: 'css' | 'less' | 'scs';
    value: string;
  };
  componentsMeta: ComponentMetaType[];
  thirdLibs?: ThirdLibType[];
  componentsTree: {
    componentName: 'Page';
    children: CSchema[];
  };
};

const CPageDataTypeDescribe = object({
  version: string(),
  pageName: string(),
  style: optional(string()),
  css: optional(string()),
  componentsMeta: array(
    assign(
      object({
        componentName: string(),
      }),
      LibMetaTypeDescribe
    )
  ),
  thirdLibs: optional(ThirdLibTypeDescribe),
  componentsTree: object({
    componentName: literal('Page'),
    children: array(any()),
  }),
});

export const checkPage = (data: any) => {
  checkComplexData({
    data: data,
    dataStruct: CPageDataTypeDescribe,
    throwError: true,
  });
  // check page children
  data?.componentsTree?.children?.forEach((it: any) => {
    checkSchema(it);
  });
};

export const parsePage = (data: any): CPageDataType => {
  return data;
};

export class CPage {
  originData: any;
  data: CPageDataType;
  constructor(data: any) {
    checkPage(data);
    this.originData = data;
    this.data = parsePage(data);
  }
}
