'use client';

import { useState, ReactNode } from 'react';

export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabGroupProps {
  tabs: Tab[];
  defaultActiveId?: string;
  onTabChange?: (tabId: string) => void;
}

export function TabGroup({ tabs, defaultActiveId, onTabChange }: TabGroupProps) {
  const [activeTabId, setActiveTabId] = useState(defaultActiveId || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTabId(tabId);
    onTabChange?.(tabId);
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium transition-colors relative
              ${activeTabId === tab.id
                ? 'text-cyan-400 bg-zinc-950'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }
            `}
          >
            {tab.label}
            {activeTabId === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
        ))}
      </div>
      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab?.content}
      </div>
    </div>
  );
}

