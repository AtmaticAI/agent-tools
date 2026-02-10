import { NextRequest, NextResponse } from 'next/server';
import { crypto as cryptoTools } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('crypto');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, algorithm } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Input string required' },
        { status: 400 }
      );
    }

    const result = cryptoTools.hash(input, algorithm);

    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
