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
      case 'idealGas':
        result = physics.idealGasLaw(params);
        break;
      case 'heatTransfer':
        result = physics.heatTransfer(params.mass, params.specificHeat, params.temperatureChange);
        break;
      case 'thermalExpansion':
        result = physics.thermalExpansion(params.originalLength, params.coefficient, params.temperatureChange);
        break;
      case 'carnot':
        result = physics.carnotEfficiency(params.hotTemperature, params.coldTemperature);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
