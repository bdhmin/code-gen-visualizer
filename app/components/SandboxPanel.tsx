'use client';

import React, { useState, useEffect } from 'react';
import { Panel } from './panels/Panel';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingDots } from './LoadingDots';
import { useCompiledComponent } from '../hooks/useCompiledComponent';

interface SandboxPanelProps {
  code: string;
  title?: string;
  isStreaming?: boolean;
  isReady?: boolean;
}

export function SandboxPanel({ code, title = 'Preview', isStreaming = false, isReady = false }: SandboxPanelProps) {
  const { component: GeneratedComponent, error: compileError, key } = useCompiledComponent(code, isReady, 'Failed to create component');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    setRuntimeError(null);
  }, [key]);

  const error = compileError ?? runtimeError;

  return (
    <Panel title={title}>
      <div className="h-full overflow-auto bg-zinc-900 p-4">
        {!code ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <p>No component to preview</p>
          </div>
        ) : isStreaming ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <LoadingDots color="cyan" className="mb-3" />
            <p>Generating component...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-950/50 border border-red-800 rounded-lg">
            <h3 className="text-red-400 font-medium mb-2">Compilation Error</h3>
            <p className="text-red-300 text-sm font-mono">{error}</p>
          </div>
        ) : GeneratedComponent ? (
          <ErrorBoundary key={key} resetKey={key} onError={(e) => setRuntimeError(e.message)} title="Render Error" variant="red">
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
