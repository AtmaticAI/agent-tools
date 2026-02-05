import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('pdf');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { files, pageRanges } = body;

    if (!files || !Array.isArray(files) || files.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 files required' },
        { status: 400 }
      );
    }

    const buffers = files.map((f: string) => Buffer.from(f, 'base64'));
    const result = await pdf.merge(buffers, { pageRanges });

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
