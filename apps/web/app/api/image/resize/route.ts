import { NextRequest, NextResponse } from 'next/server';
import { image } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('image');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { file, width, height, fit } = body;

    if (!file) {
      return NextResponse.json(
        { error: 'File (base64) required' },
        { status: 400 }
      );
    }

    if (!width && !height) {
      return NextResponse.json(
        { error: 'At least one of width or height required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(file, 'base64');
    const result = await image.resize(buffer, { width, height, fit });

    return NextResponse.json({
      data: Buffer.from(result).toString('base64'),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
