import { NextRequest, NextResponse } from 'next/server';
import { datetime } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('datetime');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { a, b } = body;

    if (!a || !b) {
      return NextResponse.json(
        { error: 'Both a and b date strings required' },
        { status: 400 }
      );
    }

    const result = datetime.diff(a, b);

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
