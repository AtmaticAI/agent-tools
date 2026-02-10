import { NextRequest, NextResponse } from 'next/server';
import { xml } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('xml');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, from, to } = body;

    if (!input || !from || !to) {
      return NextResponse.json(
        { error: 'Input, from, and to format required' },
        { status: 400 }
      );
    }

    const result = xml.convert(input, from, to);

    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
