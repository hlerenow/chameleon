import { CPageDataType, parseModel } from '@chameleon/model';
import { Adapter } from './adapter';

export type RenderPropsType = {
  page: CPageDataType;
  components?: Record<any, (...args: any) => any>;
};

export const getRenderComponent = (adapter: Adapter) => {
  console.log(
    '🚀 ~ file: render.ts ~ line 4 ~ getRenderComponent ~ adapter',
    adapter
  );
  return function Render(props: RenderPropsType): any {
    const PageModel = parseModel(props.page);
    console.log(
      '🚀 ~ file: render.ts ~ line 17 ~ Render ~ PageModel',
      PageModel
    );

    console.log('🚀 ~ file: render.ts ~ line 15 ~ Render ~ props', props);

    return 123;
  };
};
