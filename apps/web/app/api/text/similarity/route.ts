import { NextRequest, NextResponse } from 'next/server';
import { text } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('text');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { a, b } = body;

    if (a === undefined || b === undefined) {
      return NextResponse.json({ error: 'Both strings (a and b) required' }, { status: 400 });
    }

    const result = text.similarity(a, b);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
