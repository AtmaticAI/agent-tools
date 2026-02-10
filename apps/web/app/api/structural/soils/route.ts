import { NextRequest, NextResponse } from 'next/server';
import { structural } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('structural');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { action, ...params } = body;

    let result: unknown;
    switch (action) {
      case 'terzaghiBearing':
        result = structural.terzaghiBearing(params.cohesion, params.depth, params.unitWeight, params.frictionAngle, params.foundationType);
        break;
      case 'lateralEarthPressure':
        result = structural.lateralEarthPressure(params.unitWeight, params.height, params.frictionAngle, params.pressureType);
        break;
      case 'settlement':
        result = structural.settlement(params.load, params.area, params.elasticModulus, params.thickness);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
