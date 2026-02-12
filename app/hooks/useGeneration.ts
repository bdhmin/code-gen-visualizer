'use client';

import { useState, useCallback, useRef } from 'react';
import { Message } from '../components/ConversationPanel';
import { getErrorMessage } from '../lib/getErrorMessage';

interface GenerationState {
  messages: Message[];
  componentCode: string;
  visualizationCode: string;
  isGenerating: boolean;
  isVisualizing: boolean;
  componentReady: boolean;
  visualizationReady: boolean;
}

// Helper to clean code output
function cleanCode(code: string): string {
  if (!code) return '';

  let cleaned = code.trim();

  // Remove markdown code blocks (various formats)
  cleaned = cleaned.replace(/^```(?:jsx|tsx|javascript|typescript|js|ts)?\s*\n?/gm, '');
  cleaned = cleaned.replace(/\n?```\s*$/gm, '');
  cleaned = cleaned.trim();

  // If there's content before "const Component", try to extract just the component
  const componentMatch = cleaned.match(/(const Component[\s\S]*)/);
  if (componentMatch) {
    cleaned = componentMatch[1];
  }

  // Remove any trailing text after the component definition ends
  const lastSemicolon = cleaned.lastIndexOf('};');
  if (lastSemicolon !== -1 && lastSemicolon < cleaned.length - 2) {
    const afterComponent = cleaned.slice(lastSemicolon + 2).trim();
    if (afterComponent && !afterComponent.startsWith('const') && !afterComponent.startsWith('function')) {
      cleaned = cleaned.slice(0, lastSemicolon + 2);
    }
  }

  return cleaned.trim();
}

export function useGeneration() {
  const [state, setState] = useState<GenerationState>({
    messages: [],
    componentCode: '',
    visualizationCode: '',
    isGenerating: false,
    isVisualizing: false,
    componentReady: false,
    visualizationReady: false,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const nextIdRef = useRef(0);

  const generate = useCallback(async (prompt: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: (nextIdRef.current++).toString(),
      role: 'user',
      content: prompt,
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isGenerating: true,
      componentCode: '',
      visualizationCode: '',
      componentReady: false,
      visualizationReady: false,
    }));

    try {
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: abortControllerRef.current.signal,
      });

      if (!generateResponse.ok) {
        const error = await generateResponse.json();
        throw new Error(error.error || 'Failed to generate component');
      }

      const { code: rawComponentCode } = await generateResponse.json();
      const componentCode = cleanCode(rawComponentCode);

      const assistantMessage: Message = {
        id: (nextIdRef.current++).toString(),
        role: 'assistant',
        content: 'Component generated! Check the Preview panel.',
      };

      setState((prev) => ({
        ...prev,
        componentCode,
        isGenerating: false,
        componentReady: true,
        messages: [...prev.messages, assistantMessage],
        isVisualizing: true,
      }));

      const visualizeResponse = await fetch('/api/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ componentCode }),
        signal: abortControllerRef.current.signal,
      });

      if (!visualizeResponse.ok) {
        const error = await visualizeResponse.json();
        throw new Error(error.error || 'Failed to generate visualization');
      }

      const { code: rawVisualizationCode } = await visualizeResponse.json();
      const visualizationCode = cleanCode(rawVisualizationCode);

      const vizMessage: Message = {
        id: (nextIdRef.current++).toString(),
        role: 'assistant',
        content: 'Code Representation is ready! Toggle to see how the code works.',
      };

      setState((prev) => ({
        ...prev,
        visualizationCode,
        isVisualizing: false,
        visualizationReady: true,
        messages: [...prev.messages, vizMessage],
      }));
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return;
      }

      const errorMessageObj: Message = {
        id: (nextIdRef.current++).toString(),
        role: 'assistant',
        content: `Sorry, there was an error: ${getErrorMessage(error)}`,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, errorMessageObj],
        isGenerating: false,
        isVisualizing: false,
      }));
    }
  }, []);

  return {
    ...state,
    generate,
    isLoading: state.isGenerating || state.isVisualizing,
  };
}
