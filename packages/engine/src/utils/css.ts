import { CSSVal } from '@/component/CSSEditor';
import { CSSType, CSSValue, isExpression } from '@chamn/model';

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

export const formatCssToNodeVal = (className: string, val: CSSVal): CSSType => {
  type StateType = keyof CSSVal;
  const res: CSSType = {
    class: className,
    value: [],
  };
  const cssList: CSSValue[] = [];
  Object.keys(val).forEach((state) => {
    const currentStateCss = val[state as StateType];
    const tempVal: CSSValue = {
      state: state,
      media: [],
      style: currentStateCss?.['normal'] || {},
    };
    Object.keys(currentStateCss || ({} as any)).forEach((mediaKey) => {
      if (mediaKey !== 'normal') {
        tempVal.media.push({
          type: 'max-width',
          value: mediaKey,
          style: currentStateCss?.[mediaKey] || {},
        });
      }
    });
    cssList.push(tempVal);
  });
  res.value = cssList;
  return res;
};

export const formatNodeValToEditor = (val?: CSSType): CSSVal => {
  if (!val) {
    return {};
  }
  const list = val.value;
  const res: CSSVal = {};

  list.forEach((el) => {
    const currentStateCss: Record<string, Record<string, string>> = {
      normal: el.style,
    };
    el.media.forEach((it) => {
      currentStateCss[it.value] = it.style;
    });
    res[el.state as keyof CSSVal] = currentStateCss;
  });

  return res;
};
