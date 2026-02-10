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
      case 'rectangle':
        result = structural.rectangleSection(params.width, params.height);
        break;
      case 'circular':
        result = structural.circularSection(params.diameter);
        break;
      case 'hollowCircular':
        result = structural.hollowCircularSection(params.outerDiameter, params.innerDiameter);
        break;
      case 'iBeam':
        result = structural.iBeamSection(params.flangeWidth, params.flangeThickness, params.webHeight, params.webThickness);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
