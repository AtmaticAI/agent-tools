import { NextRequest, NextResponse } from 'next/server';
import { archive } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('archive');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { file } = body;

    if (!file) {
      return NextResponse.json(
        { error: 'File (base64) required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(file, 'base64');
    const entries = await archive.list(buffer);

    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
