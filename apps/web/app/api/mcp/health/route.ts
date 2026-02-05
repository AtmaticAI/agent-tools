import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    server: 'agent-tools-mcp',
    version: '1.0.0',
  });
}
