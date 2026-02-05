import { NextRequest, NextResponse } from 'next/server';
import { image } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('image');
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
    const metadata = await image.getMetadata(buffer);

    return NextResponse.json({ metadata });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
