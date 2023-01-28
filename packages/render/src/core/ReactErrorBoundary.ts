import { CNode, CSchema } from '@chameleon/model';
import React from 'react';

type Props = {
  node: CNode | CSchema;
  targetComponent: any;
  onError?: (error: React.ErrorInfo) => void;
  children?: React.ReactNode | React.ReactNode[];
};
class ErrorBoundary extends React.Component<
  Props,
  {
    error: any;
    hasError: boolean;
  }
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: any) {
    // Update state to enable the next render to show the degraded UI
    return { hasError: true, error };
  }

  componentDidCatch(_: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(errorInfo);
  }

  onDoubleClick = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { onDoubleClick } = this;
      const schema = this.props.node.value;
      console.error(this.props.node, this.props.children);
      const errorView = React.createElement(
        'div',
        {
          style: {
            backgroundColor: 'rgb(255 206 215 / 13%)',
            padding: '5px',
            color: '#ff0000b0',
            textAlign: 'center',
            fontSize: '12px',
          },
        },
        'Render error, node id: ',
        schema.id,
        ', node name：',
        schema.title,
        ' component name：',
        schema.title || schema.componentName,
        React.createElement('p', null, 'msg: ', String(this.state.error)),
        React.createElement(
          'button',
          {
            onDoubleClick: onDoubleClick,
            style: {
              border: '1px solid rgba(100,100,100,0.1)',
              backgroundColor: '#fff',
              padding: '5px 10px',
              borderRadius: '2px',
              color: 'gray',
              cursor: 'pointer',
              marginTop: '5px',
            },
          },
          'double click to refresh'
        ),
        React.createElement('div', {
          style: {
            display: 'none',
          },
        })
      );
      // return errorView;
      return React.createElement(
        this.props.targetComponent,
        { onlyRenderChild: true },
        errorView
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
