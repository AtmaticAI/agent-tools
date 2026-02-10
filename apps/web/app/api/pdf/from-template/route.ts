import { NextRequest, NextResponse } from 'next/server';
import { pdf } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('pdf');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { template, data, missingFieldBehavior } = body;

    if (!template) {
      return NextResponse.json(
        { error: 'Template JSON is required' },
        { status: 400 }
      );
    }

    const result = await pdf.templateToPdf(template, data ?? {}, {
      missingFieldBehavior,
    });

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
