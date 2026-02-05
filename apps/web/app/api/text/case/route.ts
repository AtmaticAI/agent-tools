import { NextRequest, NextResponse } from 'next/server';
import { text } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('text');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, to } = body;

    if (!input) {
      return NextResponse.json({ error: 'Input text required' }, { status: 400 });
    }
    if (!to) {
      return NextResponse.json({ error: 'Target case type required' }, { status: 400 });
    }

    const result = text.convertCase(input, to);
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
