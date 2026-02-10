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
      case 'normalStress':
        result = structural.normalStress(params.force, params.area);
        break;
      case 'shearStress':
        result = structural.shearStress(params.force, params.area);
        break;
      case 'strain':
        result = structural.strain(params.deltaLength, params.originalLength);
        break;
      case 'youngsModulus':
        result = structural.youngsModulus(params.stress, params.strain);
        break;
      case 'factorOfSafety':
        result = structural.factorOfSafety(params.ultimateStress, params.workingStress);
        break;
      case 'hoopStress':
        result = structural.hoopStress(params.pressure, params.radius, params.thickness);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
