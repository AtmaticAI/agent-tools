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
      case 'ohmsLaw':
        result = physics.ohmsLaw(params);
        break;
      case 'resistors':
        result = physics.resistors(params.values, params.configuration);
        break;
      case 'coulomb':
        result = physics.coulombsLaw(params.charge1, params.charge2, params.distance);
        break;
      case 'capacitors':
        result = physics.capacitors(params.values, params.configuration);
        break;
      case 'rcCircuit':
        result = physics.rcCircuit(params.resistance, params.capacitance);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
