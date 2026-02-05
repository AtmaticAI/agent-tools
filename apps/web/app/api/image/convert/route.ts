import { NextRequest, NextResponse } from 'next/server';
import { image } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('image');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { file, format, quality } = body;

    if (!file || !format) {
      return NextResponse.json(
        { error: 'File (base64) and format required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(file, 'base64');
    const result = await image.convert(buffer, { format, quality });

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
