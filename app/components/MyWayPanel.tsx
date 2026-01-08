'use client';

import React, { useState, useEffect } from 'react';
import { createComponent } from '../lib/babel-transform';
import { Panel } from './panels/Panel';

interface MyWayPanelProps {
  code: string;
  isLoading?: boolean;
  isReady?: boolean;
  showTitle?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; resetKey?: number; onError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; resetKey?: number; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  componentDidUpdate(prevProps: { resetKey?: number }) {
    if (prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-lg m-4">
          <h3 className="text-rose-400 font-medium mb-2">Visualization Error</h3>
          <p className="text-rose-300 text-sm font-mono">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function MyWayPanel({ code, isLoading, isReady = false, showTitle = true }: MyWayPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [VisualizationComponent, setVisualizationComponent] = useState<React.ComponentType | null>(null);
  const [key, setKey] = useState(0);

  // Compile visualization when code is ready
  useEffect(() => {
    if (!code || !isReady) {
      setVisualizationComponent(null);
      return;
    }

    const result = createComponent(code, React);
    if (result.error || !result.component) {
      setError(result.error || 'Failed to create visualization');
      setVisualizationComponent(null);
      return;
    }
    
    setError(null);
    setVisualizationComponent(() => result.component);
    setKey((k) => k + 1);
  }, [code, isReady]);

  const content = (
    <div className="h-full overflow-auto bg-zinc-900 p-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
          <div className="flex space-x-1 mb-3">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p>Generating visualization...</p>
        </div>
      ) : !code ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center px-4">
          <div className="mb-4">
            <svg className="w-12 h-12 text-zinc-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">My Way View</p>
          <p className="text-sm">
            A personalized visualization of how your generated code works.
          </p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-lg">
          <h3 className="text-rose-400 font-medium mb-2">Visualization Error</h3>
          <p className="text-rose-300 text-sm font-mono">{error}</p>
        </div>
      ) : VisualizationComponent ? (
        <ErrorBoundary key={key} resetKey={key} onError={(e) => setError(e.message)}>
          <VisualizationComponent />
        </ErrorBoundary>
      ) : (
        <div className="flex items-center justify-center h-full text-zinc-500">
          <p>Waiting for visualization...</p>
        </div>
      )}
    </div>
  );

  if (!showTitle) {
    return <div className="h-full w-full">{content}</div>;
  }

  return <Panel title="My Way View">{content}</Panel>;
}
