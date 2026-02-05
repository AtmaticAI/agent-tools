import { NextRequest, NextResponse } from 'next/server';
import { diff } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('diff');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, patch, fuzz } = body;

    if (input === undefined || !patch) {
      return NextResponse.json(
        { error: 'Input and patch required' },
        { status: 400 }
      );
    }

    const result = diff.apply(input, patch, { fuzz });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
