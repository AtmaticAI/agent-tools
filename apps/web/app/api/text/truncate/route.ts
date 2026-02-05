import { NextRequest, NextResponse } from 'next/server';
import { text } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('text');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, length, boundary, suffix } = body;

    if (!input) {
      return NextResponse.json({ error: 'Input text required' }, { status: 400 });
    }
    if (!length) {
      return NextResponse.json({ error: 'Length required' }, { status: 400 });
    }

    const result = text.truncate(input, { length, boundary, suffix });
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
