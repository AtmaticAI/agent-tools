import { NextRequest, NextResponse } from 'next/server';
import { physics } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('physics');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { action, ...params } = body;

    let result: unknown;
    switch (action) {
      case 'wave':
        result = physics.waveEquation(params);
        break;
      case 'doppler':
        result = physics.dopplerEffect(params.sourceFrequency, params.sourceVelocity, params.observerVelocity, params.mediumSpeed, params.approaching);
        break;
      case 'snell':
        result = physics.snellsLaw(params.n1, params.n2, params.angle);
        break;
      case 'lens':
        result = physics.thinLens(params);
        break;
      case 'decibel':
        result = physics.decibelConversion(params.intensity1, params.intensity2);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
