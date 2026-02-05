import { NextRequest, NextResponse } from 'next/server';
import { excel } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('excel');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { file, format, sheet, header } = body;

    if (!file || !format) {
      return NextResponse.json(
        { error: 'File (base64) and format required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(file, 'base64');
    const result = await excel.convert(buffer, format, { sheet, header });

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
