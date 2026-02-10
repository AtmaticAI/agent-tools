'use client';

import { useState, useCallback } from 'react';
import * as markdown from '@atmaticai/agent-tools/markdown';
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
import { Copy, Download, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard, downloadFile } from '@/lib/utils';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

export default function MarkdownPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [convertFrom, setConvertFrom] = useState<'markdown' | 'html' | 'text'>('markdown');
  const [convertTo, setConvertTo] = useState<'markdown' | 'html' | 'text'>('html');
  const { containerRef } = useFullscreenContainer();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const handleConvert = useCallback(() => {
    try {
      const result = markdown.convert(input, { from: convertFrom, to: convertTo });
      setOutput(result);
      setSidebarCollapsed(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [input, convertFrom, convertTo, setSidebarCollapsed]);

  const handleToc = useCallback(() => {
    const entries = markdown.generateToc(input);
    const rendered = markdown.renderToc(entries);
    setOutput(rendered || 'No headings found');
    setSidebarCollapsed(true);
  }, [input, setSidebarCollapsed]);

  const handleLinks = useCallback(() => {
    const links = markdown.extractLinks(input);
    setOutput(JSON.stringify(links, null, 2));
    setSidebarCollapsed(true);
  }, [input, setSidebarCollapsed]);

  const handleFrontmatter = useCallback(() => {
    const fm = markdown.extractFrontmatter(input);
    setOutput(fm ? JSON.stringify(fm, null, 2) : 'No frontmatter found');
    setSidebarCollapsed(true);
  }, [input, setSidebarCollapsed]);

  const handleStats = useCallback(() => {
    const result = markdown.getStats(input);
    setStats(result as unknown as Record<string, unknown>);
  }, [input]);

  return (
    <main className="flex-1 overflow-auto p-6" ref={containerRef}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Markdown Studio</h1>
            <p className="text-muted-foreground">
              Convert, analyze, and extract data from Markdown documents
            </p>
            <ToolEnableToggle toolId="markdown" />
          </div>
          <AIIntegrationBadge tool="markdown" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Paste Markdown, HTML, or plain text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="# Hello World\n\nSome **markdown** content..."
                className="min-h-[300px] font-mono text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleToc} variant="outline">
                  <FileText className="mr-1 h-4 w-4" />
                  TOC
                </Button>
                <Button onClick={handleLinks} variant="outline">Links</Button>
                <Button onClick={handleFrontmatter} variant="outline">Frontmatter</Button>
                <Button onClick={handleStats} variant="outline">Stats</Button>
                <Button
                  onClick={() => {
                    setInput('');
                    setOutput('');
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
              </div>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => downloadFile(output, 'output.md', 'text/markdown')}
                  disabled={!output}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <FullscreenButton targetRef={containerRef} />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <pre className="whitespace-pre-wrap font-mono text-sm">{output}</pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {stats && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Document Statistics</CardTitle>
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
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Convert</span>
              <Select value={convertFrom} onValueChange={(v) => setConvertFrom(v as 'markdown' | 'html' | 'text')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">to</span>
              <Select value={convertTo} onValueChange={(v) => setConvertTo(v as 'markdown' | 'html' | 'text')}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="markdown">Markdown</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleConvert}>Convert</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
