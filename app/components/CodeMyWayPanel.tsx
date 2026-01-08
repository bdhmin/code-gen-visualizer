'use client';

import { useState } from 'react';
import { CodePanel } from './CodePanel';
import { MyWayPanel } from './MyWayPanel';

interface CodeMyWayPanelProps {
  componentCode: string;
  visualizationCode: string;
  isVisualizing: boolean;
  visualizationReady: boolean;
}

type ViewType = 'code' | 'myway' | 'myway-code';

export function CodeMyWayPanel({ 
  componentCode, 
  visualizationCode, 
  isVisualizing,
  visualizationReady,
}: CodeMyWayPanelProps) {
  const [activeView, setActiveView] = useState<ViewType>('code');

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950">
      {/* Toggle bar */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/50">
        <button
          onClick={() => setActiveView('code')}
          className={`
            flex-1 px-2 py-2 text-xs font-medium transition-colors relative
            ${activeView === 'code'
              ? 'text-cyan-400 bg-zinc-950'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }
          `}
        >
          Code
          {activeView === 'code' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
          )}
        </button>
        <button
          onClick={() => setActiveView('myway')}
          className={`
            flex-1 px-2 py-2 text-xs font-medium transition-colors relative
            ${activeView === 'myway'
              ? 'text-amber-400 bg-zinc-950'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }
          `}
        >
          My Way
          {isVisualizing && (
            <span className="ml-1 inline-flex">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            </span>
          )}
          {activeView === 'myway' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
          )}
        </button>
        <button
          onClick={() => setActiveView('myway-code')}
          className={`
            flex-1 px-2 py-2 text-xs font-medium transition-colors relative
            ${activeView === 'myway-code'
              ? 'text-emerald-400 bg-zinc-950'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }
          `}
        >
          My Way Code
          {activeView === 'myway-code' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'code' && (
          <CodePanel code={componentCode} />
        )}
        {activeView === 'myway' && (
          <MyWayPanel 
            code={visualizationCode} 
            isLoading={isVisualizing} 
            isReady={visualizationReady}
            showTitle={false} 
          />
        )}
        {activeView === 'myway-code' && (
          <CodePanel code={visualizationCode} />
        )}
      </div>
    </div>
  );
}
