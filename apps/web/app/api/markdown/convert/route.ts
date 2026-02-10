import { NextRequest, NextResponse } from 'next/server';
import { markdown } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('markdown');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, from, to, gfm } = body;

    if (!input || !from || !to) {
      return NextResponse.json(
        { error: 'Input, from, and to format required' },
        { status: 400 }
      );
    }

    const result = markdown.convert(input, { from, to, gfm });

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
