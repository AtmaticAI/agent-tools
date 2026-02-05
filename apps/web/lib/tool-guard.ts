import { NextResponse } from 'next/server';
import { settingsService } from '@agent-tools/core/settings';
import type { ToolCategory } from '@agent-tools/core/settings';

export async function guardTool(category: string): Promise<NextResponse | null> {
  const enabled = await settingsService.isToolEnabled(category as ToolCategory);
  if (!enabled) {
    return NextResponse.json(
      { error: `The "${category}" tool category is currently disabled. Enable it in Settings.` },
      { status: 404 }
    );
  }
  return null;
}
