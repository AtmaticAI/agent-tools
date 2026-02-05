import { NextRequest, NextResponse } from 'next/server';
import { color } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('color');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { color1, color2, ratio } = body;

    if (!color1 || !color2) {
      return NextResponse.json({ error: 'Both color1 and color2 required' }, { status: 400 });
    }

    const result = color.blendColors(color1, color2, ratio);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
