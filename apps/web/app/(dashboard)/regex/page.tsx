'use client';

import { useState, useCallback } from 'react';
import * as regex from '@agent-tools/core/regex';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Trash2, AlertCircle, Search, Replace } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

export default function RegexPage() {
  const [input, setInput] = useState('');
  const [pattern, setPattern] = useState('');
  const [replacement, setReplacement] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [caseInsensitive, setCaseInsensitive] = useState(false);
  const [multiline, setMultiline] = useState(false);
  const [globalMatch, setGlobalMatch] = useState(true);
  const { containerRef, contentRef } = useFullscreenContainer();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const handleTest = useCallback(() => {
    try {
      const result = regex.test(input, pattern, { caseInsensitive, multiline });
      setOutput(JSON.stringify(result, null, 2));
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, pattern, caseInsensitive, multiline, setSidebarCollapsed]);

  const handleReplace = useCallback(() => {
    try {
      const result = regex.replace(input, pattern, replacement, {
        caseInsensitive,
        multiline,
        global: globalMatch,
      });
      setOutput(JSON.stringify(result, null, 2));
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, pattern, replacement, caseInsensitive, multiline, globalMatch, setSidebarCollapsed]);

  const handleExtract = useCallback(() => {
    try {
      const result = regex.extract(input, pattern, { caseInsensitive, multiline });
      setOutput(JSON.stringify(result, null, 2));
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, pattern, caseInsensitive, multiline, setSidebarCollapsed]);

  const handleValidate = useCallback(() => {
    const result = regex.validate(pattern);
    setOutput(JSON.stringify(result, null, 2));
    setError('');
  }, [pattern]);

  return (
    <main className="flex-1 overflow-auto p-6" ref={containerRef}>
      <div ref={contentRef}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Regex Tester</h1>
            <p className="text-muted-foreground">
              Test, replace, extract, and validate regular expressions
            </p>
            <ToolEnableToggle toolId="regex" />
          </div>
          <AIIntegrationBadge tool="regex" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Pattern</label>
                <Input
                  placeholder="\\d+|[A-Z]\\w+"
                  className="font-mono"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Replacement (for replace)</label>
                <Input
                  placeholder="$1_replaced"
                  className="font-mono"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Test String</label>
                <Textarea
                  placeholder="Enter text to test against..."
                  className="min-h-[200px] font-mono text-sm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={caseInsensitive} onCheckedChange={setCaseInsensitive} />
                  <span className="text-sm">Case insensitive</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={multiline} onCheckedChange={setMultiline} />
                  <span className="text-sm">Multiline</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={globalMatch} onCheckedChange={setGlobalMatch} />
                  <span className="text-sm">Global</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleTest}>
                  <Search className="mr-1 h-4 w-4" />
                  Test
                </Button>
                <Button onClick={handleReplace} variant="outline">
                  <Replace className="mr-1 h-4 w-4" />
                  Replace
                </Button>
                <Button onClick={handleExtract} variant="outline">Extract</Button>
                <Button onClick={handleValidate} variant="outline">Validate</Button>
                <Button
                  onClick={() => {
                    setInput('');
                    setPattern('');
                    setReplacement('');
                    setOutput('');
                    setError('');
                  }}
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
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
                  disabled={!output}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <FullscreenButton />
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <ScrollArea className="h-[400px]">
                <pre className="whitespace-pre-wrap font-mono text-sm">{output}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
