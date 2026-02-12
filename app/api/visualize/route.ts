import { NextRequest, NextResponse } from 'next/server';
import { generateVisualization } from '../../lib/anthropic';
import { getErrorMessage } from '../../lib/getErrorMessage';
import { VISUALIZATION_GENERATION_PROMPT } from '../../lib/prompts';

export async function POST(request: NextRequest) {
  try {
    const { componentCode } = await request.json();

    if (!componentCode || typeof componentCode !== 'string') {
      return NextResponse.json(
        { error: 'Component code is required' },
        { status: 400 }
      );
    }

    const code = await generateVisualization(componentCode, VISUALIZATION_GENERATION_PROMPT);
    return NextResponse.json({ code });
  } catch (error) {
    console.error('Visualization error:', error);
    return NextResponse.json(
      { error: `Failed to generate visualization: ${getErrorMessage(error)}` },
      { status: 500 }
    );
  }
}
