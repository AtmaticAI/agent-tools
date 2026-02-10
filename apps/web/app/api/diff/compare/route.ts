import { NextRequest, NextResponse } from 'next/server';
import { diff } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('diff');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { a, b, type, ignoreWhitespace } = body;

    if (a === undefined || b === undefined) {
      return NextResponse.json(
        { error: 'Both a and b strings required' },
        { status: 400 }
      );
    }

    const result = diff.compare(a, b, { type, ignoreWhitespace });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
