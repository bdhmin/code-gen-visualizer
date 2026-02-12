'use client';

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  resetKey?: number;
  onError?: (error: Error) => void;
  title?: string;
  variant?: 'red' | 'rose';
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const variantClasses = {
  red: {
    container: 'bg-red-950/50 border-red-800',
    title: 'text-red-400',
    message: 'text-red-300',
  },
  rose: {
    container: 'bg-rose-950/50 border-rose-800',
    title: 'text-rose-400',
    message: 'text-rose-300',
  },
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      const variant = this.props.variant ?? 'red';
      const classes = variantClasses[variant];
      const title = this.props.title ?? 'Error';
      return (
        <div className={`p-4 border rounded-lg m-4 ${classes.container}`}>
          <h3 className={`font-medium mb-2 ${classes.title}`}>{title}</h3>
          <p className={`text-sm font-mono ${classes.message}`}>{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
