import { CPluginCtx } from '../../../../core/pluginManager';

export type CSetter<T = any> = {
  (props: CSetterProps<T>): JSX.Element;
  setterName: string;
};

export type CSetterProps<T = { _: any }> = {
  onValueChange?: (val: any) => void;
  initialValue?: any;
  value?: any;
  setterContext: {
    pluginCtx: CPluginCtx;
    setCollapseHeaderExt?: (el: React.ReactNode) => void;
    onSetterChange: (keyPaths: string[], setterName: string) => void;
    keyPaths: string[];
    label: string;
  };
} & T;
