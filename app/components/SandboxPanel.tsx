'use client';

import React, { useState, useEffect } from 'react';
import { createComponent } from '../lib/babel-transform';
import { Panel } from './panels/Panel';

interface SandboxPanelProps {
  code: string;
  title?: string;
  isStreaming?: boolean;
  isReady?: boolean;
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
        <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg m-4">
          <h3 className="text-red-400 font-medium mb-2">Render Error</h3>
          <p className="text-red-300 text-sm font-mono">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function SandboxPanel({ code, title = 'Preview', isStreaming = false, isReady = false }: SandboxPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [GeneratedComponent, setGeneratedComponent] = useState<React.ComponentType | null>(null);
  const [key, setKey] = useState(0);

  // Compile component when code is ready
  useEffect(() => {
    if (!code || !isReady) {
      setGeneratedComponent(null);
      return;
    }

    const result = createComponent(code, React);
    if (result.error || !result.component) {
      setError(result.error || 'Failed to create component');
      setGeneratedComponent(null);
      return;
    }
    
    setError(null);
    setGeneratedComponent(() => result.component);
    setKey((k) => k + 1);
  }, [code, isReady]);

  return (
    <Panel title={title}>
      <div className="h-full overflow-auto bg-zinc-900 p-4">
        {!code ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <p>No component to preview</p>
          </div>
        ) : isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <div className="flex space-x-1 mb-3">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p>Generating component...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg">
            <h3 className="text-red-400 font-medium mb-2">Compilation Error</h3>
            <p className="text-red-300 text-sm font-mono">{error}</p>
          </div>
        ) : GeneratedComponent ? (
          <ErrorBoundary key={key} resetKey={key} onError={(e) => setError(e.message)}>
            <GeneratedComponent />
          </ErrorBoundary>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <p>Waiting for component...</p>
          </div>
        )}
      </div>
    </Panel>
  );
}
