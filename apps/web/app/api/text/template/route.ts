import { NextRequest, NextResponse } from 'next/server';
import { text } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('text');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { template, variables } = body;

    if (!template) {
      return NextResponse.json({ error: 'Template string required' }, { status: 400 });
    }

    const result = text.interpolate(template, variables || {});
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
