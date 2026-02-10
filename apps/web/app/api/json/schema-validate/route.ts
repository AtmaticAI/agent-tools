import { NextRequest, NextResponse } from 'next/server';
import { json } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('json');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { input, schema } = body;

    if (!input) {
      return NextResponse.json(
        { error: 'Input JSON string required' },
        { status: 400 }
      );
    }

    if (!schema) {
      return NextResponse.json(
        { error: 'JSON Schema string required' },
        { status: 400 }
      );
    }

    const result = json.validateWithSummary(input, schema);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
