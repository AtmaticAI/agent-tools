import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('pdf');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { file, ranges } = body;

    if (!file || !ranges) {
      return NextResponse.json(
        { error: 'File and ranges required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(file, 'base64');
    const results = await pdf.split(buffer, { ranges });

    return NextResponse.json({
      files: results.map((r) => Buffer.from(r).toString('base64')),
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
