import { CNodePropsTypeEnum } from '../const/schema';

export const isJSslotNode = (data: any) => {
  if (data?.type == CNodePropsTypeEnum.JSSLOT) {
    return true;
  } else {
    return false;
  }
};
