'use client';

import React, { useState, useEffect } from 'react';
import { createComponent } from '../lib/babel-transform';

export function useCompiledComponent(
  code: string,
  isReady: boolean,
  fallbackError = 'Failed to create component'
) {
  const [component, setComponent] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!code || !isReady) {
      setComponent(null);
      setError(null);
      return;
    }

    const result = createComponent(code, React);
    if (result.error || !result.component) {
      setError(result.error ?? fallbackError);
      setComponent(null);
      return;
    }

    setError(null);
    setComponent(() => result.component);
    setKey((k) => k + 1);
  }, [code, isReady]);

  return { component, error, key };
}
