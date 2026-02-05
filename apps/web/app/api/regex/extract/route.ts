import { NextRequest, NextResponse } from 'next/server';
import { regex } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('regex');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, pattern, flags } = body;

    if (!input || !pattern) {
      return NextResponse.json(
        { error: 'Input and pattern required' },
        { status: 400 }
      );
    }

    const result = regex.extract(input, pattern, { flags });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
