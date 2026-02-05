'use client';

import { useState, useCallback } from 'react';
import * as xml from '@agent-tools/core/xml';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Download, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard, downloadFile } from '@/lib/utils';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

export default function XmlPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [convertFrom, setConvertFrom] = useState<'xml' | 'json'>('xml');
  const [convertTo, setConvertTo] = useState<'xml' | 'json'>('json');
  const [queryPath, setQueryPath] = useState('');
  const { containerRef } = useFullscreenContainer();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const handleFormat = useCallback(() => {
    try {
      const result = xml.format(input);
      setOutput(result);
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, setSidebarCollapsed]);

  const handleMinify = useCallback(() => {
    try {
      const result = xml.minify(input);
      setOutput(result);
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, setSidebarCollapsed]);

  const handleValidate = useCallback(() => {
    try {
      const result = xml.validate(input);
      setOutput(JSON.stringify(result, null, 2));
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, setSidebarCollapsed]);

  const handleConvert = useCallback(() => {
    try {
      const result = xml.convert(input, convertFrom, convertTo);
      setOutput(result);
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, convertFrom, convertTo, setSidebarCollapsed]);

  const handleQuery = useCallback(() => {
    try {
      const result = xml.query(input, queryPath);
      setOutput(JSON.stringify(result, null, 2));
      setError('');
      setSidebarCollapsed(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input, queryPath, setSidebarCollapsed]);

  const handleStats = useCallback(() => {
    try {
      const result = xml.getStats(input);
      setStats(result as unknown as Record<string, unknown>);
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input]);

  return (
    <main className="flex-1 overflow-auto p-6" ref={containerRef}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">XML Studio</h1>
            <p className="text-muted-foreground">
              Parse, format, validate, query, and convert XML documents
            </p>
            <ToolEnableToggle toolId="xml" />
          </div>
          <AIIntegrationBadge tool="xml" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Paste your XML or JSON content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="<root><item>Hello World</item></root>"
                className="min-h-[300px] font-mono text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleFormat}>Format</Button>
                <Button onClick={handleMinify} variant="outline">
                  Minify
                </Button>
                <Button onClick={handleValidate} variant="outline">
                  Validate
                </Button>
                <Button onClick={handleStats} variant="outline">
                  Stats
                </Button>
                <Button
                  onClick={() => {
                    setInput('');
                    setOutput('');
                    setError('');
                    setStats(null);
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
              <div>
                <CardTitle>Output</CardTitle>
                <CardDescription>Processed result</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    copyToClipboard(output);
                    toast.success('Copied to clipboard');
                  }}
                  disabled={!output}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadFile(output, 'output.xml', 'application/xml')}
                  disabled={!output}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <FullscreenButton targetRef={containerRef} />
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              <ScrollArea className="h-[300px]">
                <pre className="whitespace-pre-wrap font-mono text-sm">{output}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {stats && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>XML Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="rounded-lg border p-3 text-center">
                    <div className="text-2xl font-bold">{String(value)}</div>
                    <div className="text-xs text-muted-foreground">{key}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardContent className="pt-6">
            <Tabs defaultValue="convert">
              <TabsList>
                <TabsTrigger value="convert">Convert</TabsTrigger>
                <TabsTrigger value="query">Query</TabsTrigger>
              </TabsList>
              <TabsContent value="convert" className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <Select value={convertFrom} onValueChange={(v) => setConvertFrom(v as 'xml' | 'json')}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground">to</span>
                  <Select value={convertTo} onValueChange={(v) => setConvertTo(v as 'xml' | 'json')}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleConvert}>Convert</Button>
                </div>
              </TabsContent>
              <TabsContent value="query" className="space-y-4 pt-4">
                <div className="flex items-center gap-4">
                  <Textarea
                    placeholder="root/items/item"
                    className="h-10 min-h-0 font-mono text-sm"
                    value={queryPath}
                    onChange={(e) => setQueryPath(e.target.value)}
                  />
                  <Button onClick={handleQuery}>Query</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
