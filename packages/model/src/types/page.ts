import {
  array,
  assign,
  literal,
  object,
  optional,
  string,
  union,
} from 'superstruct';
import { CSchemaDataType, CSchemaDataTypeDescribe } from './schema';
import { LibMetaType, LibMetaTypeDescribe } from './material';

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

export type ComponentMetaType = {
  componentName: string;
} & LibMetaType;

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
  componentsTree: CSchemaDataType;
};

export const CPageDataTypeDescribe = object({
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
  componentsTree: CSchemaDataTypeDescribe,
});
