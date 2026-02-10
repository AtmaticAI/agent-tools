import { NextRequest, NextResponse } from 'next/server';
import { color } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('color');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { base, type, count } = body;

    if (!base) {
      return NextResponse.json({ error: 'Base color required' }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json({ error: 'Palette type required' }, { status: 400 });
    }

    const result = color.generatePalette(base, { type, count });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
