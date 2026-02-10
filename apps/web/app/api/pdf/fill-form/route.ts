import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';
import { validateBase64File } from '@/lib/validate-file';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('pdf');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { file, data, flatten } = body;

    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 });
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        { error: 'Form data object required' },
        { status: 400 }
      );
    }

    const sizeError = validateBase64File(file);
    if (sizeError) return sizeError;

    const buffer = Buffer.from(file, 'base64');
    const result = await pdf.fillFormFields(buffer, data, { flatten });

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
