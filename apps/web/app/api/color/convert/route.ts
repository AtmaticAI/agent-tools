import { NextRequest, NextResponse } from 'next/server';
import { color } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('color');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, to } = body;

    if (!input) {
      return NextResponse.json({ error: 'Color string required' }, { status: 400 });
    }
    if (!to) {
      return NextResponse.json({ error: 'Target format required' }, { status: 400 });
    }

    const result = color.convertColor(input, to);
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
