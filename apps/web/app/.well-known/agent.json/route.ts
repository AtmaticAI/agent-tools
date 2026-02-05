import { NextRequest, NextResponse } from 'next/server';
import { getAgentCard } from '@agent-tools/a2a-agent';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const agentCard = await getAgentCard(baseUrl);

  return NextResponse.json(agentCard, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
