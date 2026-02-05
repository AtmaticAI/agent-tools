import { NextRequest, NextResponse } from 'next/server';
import { math } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('math');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { action, value, total, from, to } = body;

    if (action === 'change') {
      if (from === undefined || to === undefined) {
        return NextResponse.json({ error: 'From and to values required' }, { status: 400 });
      }
      const result = math.percentageChange(from, to);
      return NextResponse.json(result);
    }

    if (value === undefined || total === undefined) {
      return NextResponse.json({ error: 'Value and total required' }, { status: 400 });
    }

    const result = math.percentage(value, total);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
