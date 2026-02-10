import { NextRequest, NextResponse } from 'next/server';
import { regex } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('regex');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, pattern, replacement, flags, global: globalFlag } = body;

    if (!input || !pattern || replacement === undefined) {
      return NextResponse.json(
        { error: 'Input, pattern, and replacement required' },
        { status: 400 }
      );
    }

    const result = regex.replace(input, pattern, replacement, {
      flags,
      global: globalFlag,
    });

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
