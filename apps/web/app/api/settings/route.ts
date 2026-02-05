import { NextResponse } from 'next/server';
import { settingsService } from '@agent-tools/core/settings';

export async function GET() {
  try {
    const settings = await settingsService.getSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to load settings: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (!body.enabled || typeof body.enabled !== 'object') {
      return NextResponse.json(
        { error: 'Request body must include an "enabled" object' },
        { status: 400 }
      );
    }

    const settings = await settingsService.updateSettings(body.enabled);
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to save settings: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
