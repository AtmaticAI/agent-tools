import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('sql');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, dialect } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Input SQL string required' },
        { status: 400 }
      );
    }

    const result = sql.validate(input, dialect);

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
