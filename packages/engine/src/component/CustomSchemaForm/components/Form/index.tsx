import React from 'react';
import { ReactNode } from 'react';
import { CFormContext, CFormContextData, ContextState } from './context';

export type CFormProps = {
  name: string;
  children?: ReactNode | ReactNode[];
  initialValue?: Record<string, any>;
  customSetterMap: CFormContextData['customSetterMap'];
  onValueChange?: (formData: Record<string, any>, changeKeys?: string[]) => void;
} & Partial<ContextState>;

const CUSTOM_SETTER_MAP = {};

let updateState = () => {};

export const registerCustomSetter = (customSetterMap: CFormContextData['customSetterMap']) => {
  Object.assign(CUSTOM_SETTER_MAP, customSetterMap);
  updateState?.();
};
export class CForm extends React.Component<CFormProps, CFormContextData> {
  updateContext: (newState: ContextState) => void;
  isMount = false;
  constructor(props: CFormProps) {
    super(props);
    this.updateContext = (newState: ContextState, changeKeys?: string[]) => {
      this.setState({
        formState: newState,
        customSetterMap: CUSTOM_SETTER_MAP,
      });
      this.props.onValueChange?.(this.formatValue(newState), changeKeys);
    };
    updateState = () => {
      if (!this.isMount) {
        return;
      }
      this.setState({
        customSetterMap: { ...CUSTOM_SETTER_MAP, ...this.props.customSetterMap },
      });
    };
    registerCustomSetter(props.customSetterMap || {});
    this.state = {
      formName: props.name,
      formState: props.initialValue ?? {},
      conditionConfig: {},
      customSetterMap: props.customSetterMap || {},

      updateContext: this.updateContext,
      updateConditionConfig: (name: string, cb: (state: Record<string, any>) => boolean) => {
        this.setState({
          conditionConfig: {
            ...this.state.conditionConfig,
            [name]: cb,
          },
        });
      },
    };
  }

  componentDidMount(): void {
    this.isMount = true;
  }

  componentWillUnmount(): void {
    this.isMount = false;
  }

  getFieldsValue = () => {
    return this.formatValue(this.state.formState);
  };

  setFields = (state: Record<string, any>) => {
    this.setState({
      formState: state,
    });
  };

  formatValue = (data: Record<string, any>) => {
    const res: Record<string, any> = {};
    const conditionConfig = this.state.conditionConfig;
    Object.keys(data).forEach((key) => {
      const isValid = conditionConfig[key]?.(data) ?? true;
      if (isValid) {
        res[key] = data[key];
      }
    });
    return res;
  };

  render(): ReactNode {
    const { state } = this;
    const { children } = this.props;

    return <CFormContext.Provider value={state}>{children}</CFormContext.Provider>;
  }
}
