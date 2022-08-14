import { CNodePropsTypeEnum } from '../const/schema';

export const isJSslotNode = (data: any) => {
  if (data?.type == CNodePropsTypeEnum.SLOT) {
    return true;
  } else {
    return false;
  }
};

export const getRandomStr = () => {
  return Math.random().toString(32).slice(3, 9);
};
