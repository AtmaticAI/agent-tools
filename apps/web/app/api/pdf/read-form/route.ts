import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';
import { validateBase64File } from '@/lib/validate-file';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('pdf');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { file } = body;

    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    }

    const sizeError = validateBase64File(file);
    if (sizeError) return sizeError;

    const buffer = Buffer.from(file, 'base64');
    const result = await pdf.readFormFields(buffer);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
