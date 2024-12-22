export enum CNodePropsTypeEnum {
  SLOT = 'SLOT',
  FUNCTION = 'FUNCTION',
  EXPRESSION = 'EXPRESSION',
  ACTION = 'ACTION',
  EVENT = 'EVENT',
}

export enum ExportTypeEnum {
  DESIGN = 'design',
  SAVE = 'save',
}

export type ExportType = ExportTypeEnum | `${ExportTypeEnum}`;

export enum SlotRenderType {
  FUNC = 'FUNC',
  COMP = 'COMP',
}
