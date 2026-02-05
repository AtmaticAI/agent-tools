import { NextRequest, NextResponse } from 'next/server';
import { math } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('math');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { numbers } = body;

    if (!numbers || !Array.isArray(numbers)) {
      return NextResponse.json({ error: 'Array of numbers required' }, { status: 400 });
    }

    const result = math.calculateStats(numbers);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
