import { NextRequest, NextResponse } from 'next/server';
import { excel } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('excel');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { file, sheet, header } = body;

    if (!file) {
      return NextResponse.json(
        { error: 'File (base64) required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(file, 'base64');
    const parsed = await excel.parse(buffer, { sheet, header });

    return NextResponse.json({ data: parsed });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
