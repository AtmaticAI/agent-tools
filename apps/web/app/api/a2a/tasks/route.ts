import { NextRequest, NextResponse } from 'next/server';
import { createTask, listTasks } from '@atmaticai/agent-tools/a2a';

export async function GET() {
  const tasks = listTasks();
  return NextResponse.json({ tasks });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skill, input, sessionId } = body;

    if (!skill || !input) {
      return NextResponse.json(
        { error: 'skill and input required' },
        { status: 400 }
      );
    }

    const task = await createTask({ skill, input, sessionId });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
