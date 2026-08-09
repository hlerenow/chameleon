declare module '*.scss' {
  const content: { [key: string]: any };
  export = content;
}

declare module '*.worker?worker' {
  const content: any;
  export = content;
}

declare module '@chamn/layout/debug' {
  import type { ComponentType } from 'react';

  export type LayoutDebugProps = {
    renderUrl?: string;
  };

  export const LayoutDebug: ComponentType<LayoutDebugProps>;
}
