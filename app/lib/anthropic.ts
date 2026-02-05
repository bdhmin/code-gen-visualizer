import Anthropic from '@anthropic-ai/sdk';
import { getErrorMessage } from './getErrorMessage';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
}

function stripCodeFence(code: string): string {
  let result = code.trim();
  if (result.startsWith('```')) {
    result = result.replace(/^```(?:jsx|tsx|javascript|typescript|js|ts)?\s*\n?/, '');
    result = result.replace(/\n?```\s*$/, '');
  }
  return result;
}

// Helper to retry API calls with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 3, initialDelay = 1000 } = options;
  
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(getErrorMessage(error));
      
      // Check if it's a connection error worth retrying
      const isConnectionError = 
        lastError.message.includes('ECONNRESET') ||
        lastError.message.includes('Connection error') ||
        lastError.message.includes('fetch failed') ||
        lastError.message.includes('terminated');
      
      if (!isConnectionError || attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait with exponential backoff
      const delay = initialDelay * Math.pow(2, attempt);
      if (process.env.NODE_ENV === 'development') {
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export async function generateComponent(prompt: string, systemPrompt: string): Promise<string> {
  const message = await withRetry(async () => {
    return anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
  });

  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent) {
    throw new Error('No text response from Claude');
  }

  return stripCodeFence(textContent.text);
}

export async function generateVisualization(componentCode: string, systemPrompt: string): Promise<string> {
  const message = await withRetry(async () => {
    return anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Create a visual, interactive explanation of this component:\n\n${componentCode}`,
        },
      ],
    });
  });

  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent) {
    throw new Error('No text response from Claude');
  }

  return stripCodeFence(textContent.text);
}

