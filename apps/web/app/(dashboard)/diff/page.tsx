'use client';

import { useState, useCallback } from 'react';
import * as diff from '@agent-tools/core/diff';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Trash2, GitCompare } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

export default function DiffPage() {
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<{ additions: number; deletions: number; unchanged: number } | null>(null);
  const [diffType, setDiffType] = useState<'line' | 'word' | 'char'>('line');
  const { containerRef, contentRef } = useFullscreenContainer();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const handleCompare = useCallback(() => {
    try {
      const result = diff.compare(inputA, inputB, { type: diffType });
      setOutput(JSON.stringify(result.changes, null, 2));
      setStats(result.stats);
      setSidebarCollapsed(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [inputA, inputB, diffType, setSidebarCollapsed]);

  const handleUnified = useCallback(() => {
    try {
      const result = diff.unifiedDiff(inputA, inputB, {
        fromFile: 'original',
        toFile: 'modified',
      });
      setOutput(result);
      setStats(null);
      setSidebarCollapsed(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [inputA, inputB, setSidebarCollapsed]);

  return (
    <main className="flex-1 overflow-auto p-6" ref={containerRef}>
      <div ref={contentRef}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Diff & Patch</h1>
            <p className="text-muted-foreground">
              Compare texts, generate unified diffs, and apply patches
            </p>
            <ToolEnableToggle toolId="diff" />
          </div>
          <AIIntegrationBadge tool="diff" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Original (A)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Original text..."
                className="min-h-[250px] font-mono text-sm"
                value={inputA}
                onChange={(e) => setInputA(e.target.value)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Modified (B)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Modified text..."
                className="min-h-[250px] font-mono text-sm"
                value={inputB}
                onChange={(e) => setInputB(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardContent className="flex flex-wrap items-center gap-4 pt-6">
            <Select value={diffType} onValueChange={(v) => setDiffType(v as 'line' | 'word' | 'char')}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Line</SelectItem>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="char">Character</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleCompare}>
              <GitCompare className="mr-1 h-4 w-4" />
              Compare
            </Button>
            <Button onClick={handleUnified} variant="outline">
              Unified Diff
            </Button>
            <Button
              onClick={() => {
                setInputA('');
                setInputB('');
                setOutput('');
                setStats(null);
              }}
              variant="ghost"
              size="icon"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {stats && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center dark:border-green-900 dark:bg-green-950">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">+{stats.additions}</div>
                  <div className="text-xs text-green-600 dark:text-green-500">Additions</div>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center dark:border-red-900 dark:bg-red-950">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">-{stats.deletions}</div>
                  <div className="text-xs text-red-600 dark:text-red-500">Deletions</div>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <div className="text-2xl font-bold">{stats.unchanged}</div>
                  <div className="text-xs text-muted-foreground">Unchanged</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {output && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Result</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    copyToClipboard(output);
                    toast.success('Copied');
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <FullscreenButton />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <pre className="whitespace-pre-wrap font-mono text-sm">{output}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
