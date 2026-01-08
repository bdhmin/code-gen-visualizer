'use client';

import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import { Panel } from './panels/Panel';

interface CodePanelProps {
  code: string;
  title?: string;
}

export function CodePanel({ code, title }: CodePanelProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && code) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code]);

  const content = (
    <div className="h-full overflow-auto bg-zinc-950 p-4">
      {code ? (
        <pre className="text-sm font-mono leading-relaxed">
          <code ref={codeRef} className="language-tsx">
            {code}
          </code>
        </pre>
      ) : (
        <div className="flex items-center justify-center h-full text-zinc-500">
          <p>No code generated yet</p>
        </div>
      )}
    </div>
  );

  // If no title, render without Panel wrapper (for use in CodeMyWayPanel)
  if (!title) {
    return <div className="h-full w-full">{content}</div>;
  }

  return <Panel title={title}>{content}</Panel>;
}
