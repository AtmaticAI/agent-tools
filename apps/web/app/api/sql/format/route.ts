import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('sql');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, dialect, indent, uppercase } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Input SQL string required' },
        { status: 400 }
      );
    }

    const result = sql.format(input, { dialect, indent, uppercase });

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
