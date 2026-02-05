'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Settings,
  Braces,
  Table2,
  FileText,
  Code2,
  FileSpreadsheet,
  Image,
  FileType,
  Archive,
  Regex,
  GitCompare,
  Database,
  Lock,
  Clock,
  Loader2,
  Type,
  Calculator,
  Palette,
} from 'lucide-react';

interface ToolMeta {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TOOLS: ToolMeta[] = [
  { id: 'json', name: 'JSON Studio', description: 'Format, validate, query, convert, and diff JSON documents', icon: Braces },
  { id: 'crypto', name: 'Crypto & Encoding', description: 'Hash, encode, decode, and work with JWTs', icon: Lock },
  { id: 'sql', name: 'SQL Studio', description: 'Format, parse, and validate SQL queries', icon: Database },
  { id: 'regex', name: 'Regex Tester', description: 'Test, replace, and extract with regular expressions', icon: Regex },
  { id: 'diff', name: 'Diff & Patch', description: 'Compare texts and apply unified diffs', icon: GitCompare },
  { id: 'csv', name: 'CSV Viewer', description: 'Parse, filter, convert, and analyze CSV data', icon: Table2 },
  { id: 'datetime', name: 'Date/Time Tools', description: 'Parse, format, convert timezones, and analyze cron expressions', icon: Clock },
  { id: 'markdown', name: 'Markdown Studio', description: 'Convert, generate TOC, and analyze Markdown documents', icon: FileType },
  { id: 'xml', name: 'XML Studio', description: 'Parse, format, validate, and convert XML documents', icon: Code2 },
  { id: 'pdf', name: 'PDF Toolkit', description: 'Merge, split, extract text, and generate PDFs', icon: FileText },
  { id: 'excel', name: 'Excel Viewer', description: 'Parse, convert, and analyze Excel workbooks', icon: FileSpreadsheet },
  { id: 'image', name: 'Image Toolkit', description: 'Resize, convert, and extract metadata from images', icon: Image },
  { id: 'archive', name: 'Archive Manager', description: 'Create, extract, and list archive contents', icon: Archive },
  { id: 'text', name: 'Text Utilities', description: 'Case conversion, slugify, word count, similarity, and template interpolation', icon: Type },
  { id: 'math', name: 'Math Utilities', description: 'Unit conversion, base conversion, statistics, and number formatting', icon: Calculator },
  { id: 'color', name: 'Color Utilities', description: 'Color parsing, conversion, contrast checking, palette generation, and blending', icon: Palette },
];

export default function SettingsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [savedEnabled, setSavedEnabled] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setEnabled(data.enabled ?? {});
        setSavedEnabled(data.enabled ?? {});
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const enabledCount = Object.values(enabled).filter(Boolean).length;
  const hasChanges = JSON.stringify(enabled) !== JSON.stringify(savedEnabled);

  const toggleTool = useCallback((id: string) => {
    setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const setAll = useCallback((value: boolean) => {
    setEnabled((prev) => {
      const next: Record<string, boolean> = {};
      for (const key of Object.keys(prev)) {
        next[key] = value;
      }
      return next;
    });
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSavedEnabled({ ...enabled });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }, [enabled]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Enable or disable tool categories
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {enabledCount} of {TOOLS.length} enabled
          </span>
          <Button variant="outline" size="sm" onClick={() => setAll(true)}>
            Enable All
          </Button>
          <Button variant="outline" size="sm" onClick={() => setAll(false)}>
            Disable All
          </Button>
          <Button size="sm" onClick={save} disabled={saving || !hasChanges}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isEnabled = enabled[tool.id] ?? true;
          return (
            <Card
              key={tool.id}
              className={!isEnabled ? 'opacity-60' : undefined}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium">{tool.name}</CardTitle>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => toggleTool(tool.id)}
                />
              </CardHeader>
              <CardContent>
                <CardDescription>{tool.description}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
