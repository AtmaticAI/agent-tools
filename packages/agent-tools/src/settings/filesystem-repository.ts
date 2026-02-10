import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import type { ToolSettings, SettingsRepository, ToolCategory } from './types';
import { DEFAULT_SETTINGS, ALL_TOOL_CATEGORIES } from './defaults';

export class FilesystemSettingsRepository implements SettingsRepository {
  private readonly filePath: string;

  constructor(dataDir?: string) {
    const dir = dataDir ?? join(process.cwd(), 'data');
    this.filePath = join(dir, 'settings.json');
  }

  getDefaults(): ToolSettings {
    return {
      ...DEFAULT_SETTINGS,
      enabled: { ...DEFAULT_SETTINGS.enabled },
      updatedAt: new Date().toISOString(),
    };
  }

  async load(): Promise<ToolSettings> {
    try {
      if (!existsSync(this.filePath)) {
        const defaults = this.getDefaults();
        await this.save(defaults);
        return defaults;
      }

      const raw = await readFile(this.filePath, 'utf-8');
      const data = JSON.parse(raw) as Partial<ToolSettings>;

      // Merge with defaults to handle newly added tools
      const merged: ToolSettings = {
        version: data.version ?? DEFAULT_SETTINGS.version,
        updatedAt: data.updatedAt ?? new Date().toISOString(),
        enabled: { ...DEFAULT_SETTINGS.enabled },
      };

      if (data.enabled) {
        for (const category of ALL_TOOL_CATEGORIES) {
          if (category in data.enabled) {
            merged.enabled[category] = data.enabled[category as ToolCategory]!;
          }
        }
      }

      return merged;
    } catch {
      return this.getDefaults();
    }
  }

  async save(settings: ToolSettings): Promise<void> {
    const dir = join(this.filePath, '..');
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(this.filePath, JSON.stringify(settings, null, 2), 'utf-8');
  }
}
