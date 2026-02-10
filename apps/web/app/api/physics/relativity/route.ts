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
      case 'lorentz':
        result = physics.lorentzFactor(params.velocity);
        break;
      case 'timeDilation':
        result = physics.timeDilation(params.properTime, params.velocity);
        break;
      case 'lengthContraction':
        result = physics.lengthContraction(params.properLength, params.velocity);
        break;
      case 'massEnergy':
        result = physics.massEnergy(params.mass);
        break;
      case 'energyToMass':
        result = physics.energyToMass(params.energy);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
