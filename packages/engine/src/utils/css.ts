import { isExpression } from '@chameleon/model';

export type StyleArr = {
  key: string;
  value: any;
}[];

export const styleArr2Obj = (val: StyleArr) => {
  const res: Record<string, any> = {};
  val.forEach((item) => {
    res[item.key] = item.value;
  });
  return res;
};

export const formatCSSProperty = (cssVal: Record<string, any>) => {
  const normalProperty: { key: string; value: string }[] = [];
  const expressionProperty: { key: string; value: any }[] = [];
  Object.keys(cssVal).forEach((key) => {
    const val = cssVal[key];
    if (isExpression(val)) {
      expressionProperty.push({
        key,
        value: val,
      });
    } else {
      normalProperty.push({
        key,
        value: val,
      });
    }
  });
  const res = {
    normalProperty,
    expressionProperty,
  };
  return res;
};
