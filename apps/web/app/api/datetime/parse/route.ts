import { NextRequest, NextResponse } from 'next/server';
import { datetime } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('datetime');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, timezone } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Input date string required' },
        { status: 400 }
      );
    }

    const result = datetime.parseDate(input, timezone);

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
