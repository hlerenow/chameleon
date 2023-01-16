export type CSetter<T = any> = {
  (props: CSetterProps<T>): JSX.Element;
  setterName: string;
};

export type CSetterProps<T = any> = {
  onValueChange?: ((val: any) => void) | undefined;
  value?: unknown;
  setCollapseHeaderExt?: (el: React.ReactNode) => void;
  keyPaths: string[];
} & T;
