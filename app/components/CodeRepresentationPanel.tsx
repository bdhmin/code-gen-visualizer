'use client';

import React, { useState, useEffect } from 'react';
import { Panel } from './panels/Panel';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingDots } from './LoadingDots';
import { useCompiledComponent } from '../hooks/useCompiledComponent';

interface CodeRepresentationPanelProps {
  code: string;
  isLoading?: boolean;
  isReady?: boolean;
  showTitle?: boolean;
}

export function CodeRepresentationPanel({ code, isLoading, isReady = false, showTitle = true }: CodeRepresentationPanelProps) {
  const { component: VisualizationComponent, error: compileError, key } = useCompiledComponent(code, isReady, 'Failed to create visualization');
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  useEffect(() => {
    setRuntimeError(null);
  }, [key]);

  const error = compileError ?? runtimeError;

  const content = (
    <div className="h-full overflow-auto bg-zinc-900 p-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
          <LoadingDots color="amber" className="mb-3" />
          <p>Generating visualization...</p>
        </div>
      ) : !code ? (
        <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-center px-4">
          <div className="mb-4">
            <svg className="w-12 h-12 text-zinc-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-lg font-medium mb-2">Code Representation</p>
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
        <ErrorBoundary key={key} resetKey={key} onError={(e) => setRuntimeError(e.message)} title="Visualization Error" variant="rose">
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

  return <Panel title="Code Representation">{content}</Panel>;
}

