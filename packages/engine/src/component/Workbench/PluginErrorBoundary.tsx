import React from 'react';

type PluginErrorBoundaryProps = {
  area: string;
  children: React.ReactNode;
};

type PluginErrorBoundaryState = {
  hasError: boolean;
};

/** Keeps a plugin view failure from unmounting the whole workbench. */
export class PluginErrorBoundary extends React.Component<PluginErrorBoundaryProps, PluginErrorBoundaryState> {
  state: PluginErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PluginErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Plugin ${this.props.area} render failed`, error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return <div style={{ padding: 12, color: '#999', fontSize: 12 }}>Plugin view failed to render.</div>;
  }
}
