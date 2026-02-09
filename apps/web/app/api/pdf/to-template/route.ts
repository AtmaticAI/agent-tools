import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';
import { validateBase64File } from '@/lib/validate-file';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('pdf');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { file, name, description } = body;

    if (!file || typeof file !== 'string') {
      return NextResponse.json(
        { error: 'Base64-encoded PDF file is required' },
        { status: 400 }
      );
    }

    const sizeError = validateBase64File(file);
    if (sizeError) return sizeError;

    const buffer = Buffer.from(file, 'base64');
    const template = await pdf.pdfToTemplate(buffer, { name, description });

    return NextResponse.json({ template });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
