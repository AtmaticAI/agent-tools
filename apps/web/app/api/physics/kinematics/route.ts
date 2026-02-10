import { NextRequest, NextResponse } from 'next/server';
import { physics } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('physics');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { displacement, initialVelocity, finalVelocity, acceleration, time } = body;
    const result = physics.solveKinematics({ displacement, initialVelocity, finalVelocity, acceleration, time });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
