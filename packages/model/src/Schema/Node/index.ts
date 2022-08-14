export type NormalPropType = string | boolean | number | Record<string, any>;

export enum CNodePropsTypeEnum {
  JSSLOT = 'JSSLOT',
  FUNCTION = 'FUNCTION',
  JSEXPRESSION = 'JSEXPRESSION',
}

export type RenderPropType = {
  type: CNodePropsTypeEnum.JSSLOT;
  value: CNodeData[];
};

export type JSExpressionPropType = {
  type: CNodePropsTypeEnum.JSEXPRESSION;
  value: string;
};

export type FunctionPropType = {
  type: CNodePropsTypeEnum.FUNCTION;
  value: string;
};

export type SpecialProps = RenderPropType | JSExpressionPropType;

export type PropType = NormalPropType | SpecialProps;

// 开发模式使用的 key,导出为生产模式时，需要移除
export const DevKey = ['configure'];

export type CNodeData = {
  id: string;
  componentName: string;
  props: Record<string, PropType>;
  /**
   * only used in dev mode, if you are run in prod, this key will be undefined
   *
   * @type {Record<any, any>}
   */
  configure?: Record<any, any>;
};

export const parseNode = (data: any) => {
  console.log(data);
};

class CNode {
  data: void;
  constructor(data: any) {
    this.data = parseNode(data);
  }
}
