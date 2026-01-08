import { NextRequest, NextResponse } from 'next/server';
import { generateComponent } from '../../lib/anthropic';
import { COMPONENT_GENERATION_PROMPT } from '../../lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const code = await generateComponent(prompt, COMPONENT_GENERATION_PROMPT);
    return NextResponse.json({ code });
  } catch (error) {
    console.error('Generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate component: ${errorMessage}` },
      { status: 500 }
    );
  }
}
