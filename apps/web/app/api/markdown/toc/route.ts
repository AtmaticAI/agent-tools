import { NextRequest, NextResponse } from 'next/server';
import { markdown } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('markdown');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Input markdown string required' },
        { status: 400 }
      );
    }

    const entries = markdown.generateToc(input);

    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
