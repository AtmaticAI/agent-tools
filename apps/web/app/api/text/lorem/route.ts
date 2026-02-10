import { NextRequest, NextResponse } from 'next/server';
import { text } from '@atmaticai/agent-tools';
import { guardTool } from '@/lib/tool-guard';

export async function POST(request: NextRequest) {
  const blocked = await guardTool('text');
  if (blocked) return blocked;

  try {
    const body = await request.json();
    const { count, unit } = body;

    if (!count) {
      return NextResponse.json({ error: 'Count required' }, { status: 400 });
    }

    const result = text.generateLorem(count, unit);
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
