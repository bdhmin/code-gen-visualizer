'use client';

import { ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <div className={`flex flex-col h-full w-full bg-zinc-950 ${className}`}>
      <div className="flex items-center px-4 py-2 border-b border-zinc-800 bg-zinc-900/50">
        <h2 className="text-sm font-medium text-zinc-300">{title}</h2>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

