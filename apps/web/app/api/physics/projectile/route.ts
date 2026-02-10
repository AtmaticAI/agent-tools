import { NextRequest, NextResponse } from 'next/server';
import { physics } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('physics');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { initialVelocity, angle, gravity } = body;

    if (initialVelocity === undefined || angle === undefined) {
      return NextResponse.json({ error: 'initialVelocity and angle are required' }, { status: 400 });
    }

    const result = physics.projectileMotion(initialVelocity, angle, gravity);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
