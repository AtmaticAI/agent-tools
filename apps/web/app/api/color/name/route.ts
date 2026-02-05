import { NextRequest, NextResponse } from 'next/server';
import { color } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('color');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json({ error: 'Color string required' }, { status: 400 });
    }

    const result = color.colorName(input);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
