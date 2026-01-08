import * as Babel from '@babel/standalone';

export interface TransformResult {
  success: boolean;
  code?: string;
  error?: string;
}

// Clean the code of any invisible characters or issues
function sanitizeCode(code: string): string {
  return code
    // Remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove any trailing whitespace on lines
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();
}

export function transformCode(code: string): TransformResult {
  try {
    const cleanedCode = sanitizeCode(code);
    
    const result = Babel.transform(cleanedCode, {
      presets: ['env', 'react', 'typescript'],
      filename: 'component.tsx',
    });

    if (result.code) {
      return { success: true, code: result.code };
    }
    return { success: false, error: 'Transformation produced no output' };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error during transformation';
    return { success: false, error };
  }
}

export interface CreateComponentResult {
  component: React.ComponentType | null;
  error?: string;
}

export function createComponent(
  code: string,
  React: typeof import('react')
): CreateComponentResult {
  const transformResult = transformCode(code);
  
  if (!transformResult.success || !transformResult.code) {
    return { 
      component: null, 
      error: `Transform error: ${transformResult.error}` 
    };
  }

  try {
    // Create a function that returns the component
    // The transformed code expects React to be available
    const componentFactory = new Function(
      'React',
      'useState',
      'useEffect',
      'useCallback',
      'useMemo',
      'useRef',
      `
      ${transformResult.code}
      if (typeof Component !== 'undefined') {
        return Component;
      }
      throw new Error('Component not found in generated code. Make sure the component is named "Component".');
      `
    );

    const component = componentFactory(
      React,
      React.useState,
      React.useEffect,
      React.useCallback,
      React.useMemo,
      React.useRef
    );

    if (!component) {
      return { 
        component: null, 
        error: 'Component factory returned null' 
      };
    }

    return { component, error: undefined };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { 
      component: null, 
      error: `Execution error: ${errorMessage}` 
    };
  }
}
