import { NextRequest, NextResponse } from 'next/server';
import { datetime } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('datetime');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, from, to } = body;

    if (!input || !from || !to) {
      return NextResponse.json(
        { error: 'Input, from timezone, and to timezone required' },
        { status: 400 }
      );
    }

    const result = datetime.convertTimezone(input, from, to);

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
