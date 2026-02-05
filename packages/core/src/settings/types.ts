export type ToolCategory =
  | 'json'
  | 'csv'
  | 'pdf'
  | 'xml'
  | 'excel'
  | 'image'
  | 'markdown'
  | 'archive'
  | 'regex'
  | 'diff'
  | 'sql'
  | 'crypto'
  | 'datetime'
  | 'text'
  | 'math'
  | 'color';

export interface ToolSettings {
  enabled: Record<ToolCategory, boolean>;
  version: number;
  updatedAt: string;
}

export interface SettingsRepository {
  load(): Promise<ToolSettings>;
  save(settings: ToolSettings): Promise<void>;
  getDefaults(): ToolSettings;
}
