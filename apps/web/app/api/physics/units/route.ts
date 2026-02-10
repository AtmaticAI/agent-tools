import { NextRequest, NextResponse } from 'next/server';
import { physics } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('physics');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { value, from, to, category } = body;

    if (value === undefined || !from || !to || !category) {
      return NextResponse.json({ error: 'value, from, to, and category are required' }, { status: 400 });
    }

    const result = physics.convertPhysicsUnit(value, from, to, category);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
