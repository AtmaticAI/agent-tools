import { NextRequest, NextResponse } from 'next/server';
import { math } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('math');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, fromBase } = body;

    if (!input) {
      return NextResponse.json({ error: 'Input number string required' }, { status: 400 });
    }
    if (!fromBase) {
      return NextResponse.json({ error: 'Source base required' }, { status: 400 });
    }

    const result = math.convertBase(input, fromBase);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
