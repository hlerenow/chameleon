import { CSSVal } from '@/component/CSSEditor';
import { CSSType, CSSValue, JSExpressionPropType, getRandomStr, isExpression } from '@chamn/model';
import Color from 'color';
import { parse, Rule, Declaration } from 'css';

export type StyleArr = {
  property: string;
  value: any;
}[];

export const styleArr2Obj = (val: StyleArr) => {
  const res: Record<string, any> = {};
  val.forEach((item) => {
    res[item.property] = item.value;
  });
  return res;
};

export const styleList2Text = (val: StyleArr) => {
  let res = '';
  val.forEach((item) => {
    res += `${item.property}:${item.value};`;
  });
  return res;
};

export const formatCSSProperty = (cssVal: Record<string, any>) => {
  const normalProperty: { key: string; value: string }[] = [];
  const expressionProperty: { key: string; value: JSExpressionPropType }[] = [];
  const allProperty: { key: string; value: any }[] = [];
  Object.keys(cssVal).forEach((key) => {
    const val = cssVal[key];
    const obj = {
      key,
      value: val,
    };

    allProperty.push(obj);
    if (isExpression(val)) {
      expressionProperty.push(obj);
    } else {
      normalProperty.push(obj);
    }
  });
  const res = {
    normalProperty,
    expressionProperty,
    allProperty,
  };
  return res;
};

export const formatCSSTextProperty = (cssText: string) => {
  const cssAst = parse(`.node {${cssText}}`);
  const cssRule = cssAst.stylesheet?.rules[0] as Rule;
  const cssList =
    cssRule.declarations?.map((el: Declaration) => {
      return {
        id: getRandomStr(),
        property: el.property || '',
        value: el.value || '',
      };
    }) || [];
  return cssList;
};

formatCSSTextProperty('');

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
      text: currentStateCss?.['normal'] || '',
    };
    Object.keys(currentStateCss || ({} as any)).forEach((mediaKey) => {
      tempVal.media = tempVal.media || [];
      if (mediaKey !== 'normal') {
        tempVal.media.push({
          type: 'max-width',
          value: mediaKey,
          text: currentStateCss?.[mediaKey] || '',
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
    const currentStateCss: Record<string, string> = {
      normal: el.text || '',
    };
    el.media?.forEach((it) => {
      currentStateCss[it.value] = it.text || '';
    });
    res[el.state as keyof CSSVal] = currentStateCss;
  });

  return res;
};

export const getColorFromStr = (str: string) => {
  // 匹配16进制颜色（包括#号）
  const hexColorPattern = /#(?:[0-9a-fA-F]{3}){1,2}\b/g;

  // 匹配RGBA颜色
  const rgbaColorPattern = /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*(?:\d*\.\d+|\d+\.\d*|\d+)\s*\)/g;

  // 匹配RGB颜色
  const rgbColorPattern = /rgb?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g;

  // 匹配HSB颜色
  const hsbColorPattern = /hsb?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)/g;
  const hexColors = str.match(hexColorPattern) || [];
  const rgbaColors = str.match(rgbaColorPattern) || [];
  const rgbColors = str.match(rgbColorPattern) || [];
  const hsbColors = str.match(hsbColorPattern) || [];

  return [...hexColors, ...rgbaColors, ...rgbColors, ...hsbColors];
};

export type BoxShadowObjType = {
  offsetX: string | undefined;
  offsetY: string | undefined;
  blur: string | undefined;
  spread: string | undefined;
  color: string | undefined;
  type?: 'inset' | '';
};

export const parseBoxShadowString = (str: string) => {
  // 先匹配所有的 rgb（a）, 转换为对应的 16 进制,
  const colorsList = getColorFromStr(str);
  const color16Map = colorsList.reduce((res, c) => {
    res[c] = Color(c).hexa();
    return res;
  }, {} as any);
  // 替换字符串中所有的颜色为 16 进制，避免逗号影响分隔
  let tempStr = str;
  colorsList.forEach((c) => {
    tempStr = tempStr.replaceAll(c, color16Map[c]);
  });

  // 分割逗号
  const res = tempStr.split(',').map((el) => {
    const shadowItem: BoxShadowObjType = {
      offsetX: undefined,
      offsetY: undefined,
      blur: undefined,
      spread: undefined,
      color: undefined,
      type: undefined,
    };
    let newStr = el;
    if (newStr.includes('inset')) {
      shadowItem.type = 'inset';
      newStr = newStr.replace('inset', '').trim();
    }

    const color = getColorFromStr(newStr);
    if (color.length) {
      shadowItem.color = color[0];
      newStr = newStr.replace(shadowItem.color, '').trim();
    }

    const newStrArr = newStr.split(' ');
    const sizeArr = [];
    for (let i = 0; i < newStrArr.length; i++) {
      if (!isNaN(parseInt(newStrArr[i]))) {
        sizeArr.push(newStrArr[i]);
      } else {
        break;
      }
    }
    shadowItem.offsetX = sizeArr[0];
    shadowItem.offsetY = sizeArr[1];
    shadowItem.blur = sizeArr[2] || '';
    shadowItem.spread = sizeArr[3] || '';
    // 获取单词颜色
    if (!shadowItem.color) {
      shadowItem.color = newStrArr[sizeArr.length];
    }
    return shadowItem;
  });

  return res;
};
