import React from 'react';
import { ReactNode } from 'react';
import { CFormContext, CFormContextData, ContextState } from './context';

export type CFormProps = {
  name: string;
  children?: ReactNode | ReactNode[];
  onValueChange?: (formData: Record<string, any>) => void;
};
export class CForm extends React.Component<CFormProps, CFormContextData> {
  updateContext: (newState: ContextState) => void;

  constructor(props: CFormProps) {
    super(props);
    this.updateContext = (newState: ContextState) => {
      this.setState({
        formState: newState,
      });
      this.props.onValueChange?.(this.formatValue(newState));
    };
    this.state = {
      formName: props.name,
      formState: {},
      conditionConfig: {},
      updateContext: this.updateContext,
      updateConditionConfig: (
        name: string,
        cb: (state: Record<string, any>) => boolean
      ) => {
        this.setState({
          conditionConfig: {
            ...this.state.conditionConfig,
            [name]: cb,
          },
        });
      },
    };
  }

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
    const { state, context } = this;
    const { children } = this.props;

    return (
      <CFormContext.Provider value={state}>{children}</CFormContext.Provider>
    );
  }
}