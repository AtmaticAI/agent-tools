import { NextRequest, NextResponse } from 'next/server';
import { math } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('math');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { value, from, to, category } = body;

    if (value === undefined) {
      return NextResponse.json({ error: 'Value required' }, { status: 400 });
    }
    if (!from || !to || !category) {
      return NextResponse.json({ error: 'From, to, and category required' }, { status: 400 });
    }

    const result = math.convertUnit(value, from, to, category);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
