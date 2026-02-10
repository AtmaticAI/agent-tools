import { NextRequest, NextResponse } from 'next/server';
import { physics } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('physics');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { key, category } = body;

    if (key) {
      const result = physics.getConstant(key);
      return NextResponse.json(result);
    }

    const result = physics.listConstants(category);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
