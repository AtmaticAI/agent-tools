import { NextRequest, NextResponse } from 'next/server';
import { physics } from '@atmaticai/agent-tools-core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('physics');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { action, ...params } = body;

    let result: unknown;
    switch (action) {
      case 'force':
        result = physics.calculateForce(params.mass, params.acceleration);
        break;
      case 'energy':
        result = physics.calculateEnergy(params.mass, params.velocity, params.height, params.gravity);
        break;
      case 'gravity':
        result = physics.gravitationalForce(params.mass1, params.mass2, params.distance);
        break;
      case 'momentum':
        result = physics.calculateMomentum(params.mass, params.velocity);
        break;
      case 'orbital':
        result = physics.orbitalMechanics(params.mass, params.radius);
        break;
      case 'work':
        result = physics.calculateWork(params.force, params.distance, params.angle);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
