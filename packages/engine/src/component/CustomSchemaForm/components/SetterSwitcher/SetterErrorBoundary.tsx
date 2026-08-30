import React from 'react';

type SetterErrorBoundaryProps = {
  setterName?: string;
  children: React.ReactNode;
};

type SetterErrorBoundaryState = {
  hasError: boolean;
};

/** Isolates a broken setter from the rest of the property panel. */
export class SetterErrorBoundary extends React.Component<SetterErrorBoundaryProps, SetterErrorBoundaryState> {
  state: SetterErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SetterErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Setter render failed${this.props.setterName ? `: ${this.props.setterName}` : ''}`, error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          backgroundColor: 'whitesmoke',
          margin: '5px 0',
          padding: '5px',
          borderRadius: '2px',
          color: 'gray',
          fontSize: '12px',
        }}
      >
        {this.props.setterName || 'Setter'} render failed.
      </div>
    );
  }
}
