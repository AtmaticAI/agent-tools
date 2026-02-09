import { NextRequest, NextResponse } from 'next/server';
import { structural } from '@agent-tools/core';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('structural');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { action, ...params } = body;

    let result: unknown;
    switch (action) {
      case 'simplySupported':
        result = structural.simplySupported(params.length, params.load, params.loadType, params.E, params.I, params.loadPosition);
        break;
      case 'cantilever':
        result = structural.cantilever(params.length, params.load, params.loadType, params.E, params.I, params.loadPosition);
        break;
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
