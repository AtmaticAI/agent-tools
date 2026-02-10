import type { ToolCategory, ToolSettings, SettingsRepository } from './types';
import { FilesystemSettingsRepository } from './filesystem-repository';

const CACHE_TTL_MS = 5_000;

export class SettingsService {
  private cache: ToolSettings | null = null;
  private cacheTimestamp = 0;
  private readonly repository: SettingsRepository;

  constructor(repository?: SettingsRepository) {
    this.repository = repository ?? new FilesystemSettingsRepository();
  }

  async getSettings(): Promise<ToolSettings> {
    const now = Date.now();
    if (this.cache && now - this.cacheTimestamp < CACHE_TTL_MS) {
      return this.cache;
    }

    const settings = await this.repository.load();
    this.cache = settings;
    this.cacheTimestamp = now;
    return settings;
  }

  async updateSettings(enabled: Partial<Record<ToolCategory, boolean>>): Promise<ToolSettings> {
    const current = await this.repository.load();
    const updated: ToolSettings = {
      ...current,
      enabled: { ...current.enabled, ...enabled },
      updatedAt: new Date().toISOString(),
    };
    await this.repository.save(updated);
    this.cache = updated;
    this.cacheTimestamp = Date.now();
    return updated;
  }

  async isToolEnabled(category: ToolCategory): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.enabled[category] ?? true;
  }

  invalidateCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}

export const settingsService = new SettingsService();
