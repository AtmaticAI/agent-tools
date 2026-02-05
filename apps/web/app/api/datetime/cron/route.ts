import { NextRequest, NextResponse } from 'next/server';
import { datetime } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('datetime');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { expression, count } = body;

    if (!expression) {
      return NextResponse.json(
        { error: 'Cron expression required' },
        { status: 400 }
      );
    }

    const result = datetime.parseCron(expression, count);

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
