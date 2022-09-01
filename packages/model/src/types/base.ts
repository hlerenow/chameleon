import { boolean, literal, object, optional, string, union } from 'superstruct';

export type LibMetaType = {
  package: string;
  version: string;
  exportName: string;
  destructuring?: boolean;
  subName?: string;
  main?: string;
};

export const LibMetaTypeDescribe = object({
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

export const ThirdLibTypeDescribe = union([
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
