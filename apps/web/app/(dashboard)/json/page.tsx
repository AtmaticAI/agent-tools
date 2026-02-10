'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import * as json from '@atmaticai/agent-tools/json';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Copy,
  Download,
  Trash2,
  AlertCircle,
  TreePine,
  Code,
  CheckCircle2,
} from 'lucide-react';
import { cn, copyToClipboard, downloadFile } from '@/lib/utils';
import { JsonTreeView } from '@/components/json/JsonTreeView';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

export default function JsonPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [indent, setIndent] = useState<'2' | '4'>('2');
  const [sortKeys, setSortKeys] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<json.JsonStats | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'raw'>('tree');

  const { containerRef, isFullscreen } = useFullscreenContainer();
  const { setSidebarCollapsed } = useUIStore();

  // Auto-collapse sidebar when output is generated
  useEffect(() => {
    if (output) {
      setSidebarCollapsed(true);
    }
  }, [output, setSidebarCollapsed]);

  const parsedOutput = useMemo(() => {
    if (!output) return null;
    try {
      return JSON.parse(output);
    } catch {
      return null;
    }
  }, [output]);

  const handleFormat = useCallback(() => {
    try {
      const result = json.format(input, {
        indent: parseInt(indent) as 2 | 4,
        sortKeys,
      });
      setOutput(result);
      setError(null);
      setStats(json.getStats(input));
      toast.success('JSON formatted');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Invalid JSON');
    }
  }, [input, indent, sortKeys]);

  const handleMinify = useCallback(() => {
    try {
      const result = json.minify(input);
      setOutput(result);
      setError(null);
      toast.success('JSON minified');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Invalid JSON');
    }
  }, [input]);

  const handleValidate = useCallback(() => {
    const result = json.validate(input);
    if (result.valid) {
      setError(null);
      toast.success('Valid JSON');
    } else {
      setError(result.errors?.map((e) => e.message).join('\n') || 'Invalid JSON');
      toast.error('Invalid JSON');
    }
  }, [input]);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(output || input);
    toast.success('Copied to clipboard');
  }, [output, input]);

  const handleDownload = useCallback(() => {
    const content = output || input;
    downloadFile(content, 'formatted.json', 'application/json');
    toast.success('Downloaded');
  }, [output, input]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
    setStats(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">JSON Studio</h1>
          <p className="text-muted-foreground">
            Format, validate, query, and transform JSON documents
          </p>
          <ToolEnableToggle toolId="json" />
        </div>
        <AIIntegrationBadge tool="json" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Input + Actions */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Input</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='{"key": "value"}'
                className="h-[200px] font-mono text-sm resize-none"
              />

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button onClick={handleFormat}>Format</Button>
                  <Button variant="secondary" onClick={handleMinify}>
                    Minify
                  </Button>
                  <Button variant="outline" onClick={handleValidate}>
                    Validate
                  </Button>
                </div>

                <Separator orientation="vertical" className="h-8" />

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Indent:</span>
                  <Select value={indent} onValueChange={(v) => setIndent(v as '2' | '4')}>
                    <SelectTrigger className="h-8 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 spaces</SelectItem>
                      <SelectItem value="4">4 spaces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Sort keys:</span>
                  <Switch checked={sortKeys} onCheckedChange={setSortKeys} />
                </div>
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <pre className="whitespace-pre-wrap">{error}</pre>
                </div>
              )}

              {stats && !error && (
                <div className="mt-4 grid gap-3 grid-cols-4">
                  <div className="rounded-lg border bg-muted/50 p-2.5">
                    <div className="text-xs text-muted-foreground">Keys</div>
                    <div className="text-base font-semibold">{stats.keys}</div>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-2.5">
                    <div className="text-xs text-muted-foreground">Depth</div>
                    <div className="text-base font-semibold">{stats.depth}</div>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-2.5">
                    <div className="text-xs text-muted-foreground">Objects</div>
                    <div className="text-base font-semibold">{stats.objects}</div>
                  </div>
                  <div className="rounded-lg border bg-muted/50 p-2.5">
                    <div className="text-xs text-muted-foreground">Arrays</div>
                    <div className="text-base font-semibold">{stats.arrays}</div>
                  </div>
                </div>
              )}

              <Tabs defaultValue="convert" className="mt-6">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="convert">Convert</TabsTrigger>
                  <TabsTrigger value="query">Query</TabsTrigger>
                  <TabsTrigger value="diff">Diff</TabsTrigger>
                  <TabsTrigger value="schema-validate">Schema Validate</TabsTrigger>
                </TabsList>

                <TabsContent value="convert" className="mt-4">
                  <ConvertPanel input={input} />
                </TabsContent>

                <TabsContent value="query" className="mt-4">
                  <QueryPanel input={input} />
                </TabsContent>

                <TabsContent value="diff" className="mt-4">
                  <DiffPanel />
                </TabsContent>

                <TabsContent value="schema-validate" className="mt-4">
                  <SchemaValidatePanel input={input} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right: Output */}
        <div
          ref={containerRef}
          className={cn(
            'flex flex-col',
            isFullscreen && 'bg-background p-6 h-screen'
          )}
        >
          <Card className="flex flex-col flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Output</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg border bg-muted p-1">
                    <Button
                      variant={viewMode === 'tree' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setViewMode('tree')}
                    >
                      <TreePine className="mr-1.5 h-3.5 w-3.5" />
                      Tree
                    </Button>
                    <Button
                      variant={viewMode === 'raw' ? 'secondary' : 'ghost'}
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setViewMode('raw')}
                    >
                      <Code className="mr-1.5 h-3.5 w-3.5" />
                      Raw
                    </Button>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                  <FullscreenButton targetRef={containerRef} variant="ghost" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className={cn(
                'rounded-md border bg-muted/50 p-4',
                isFullscreen ? 'h-[calc(100vh-180px)]' : 'h-[600px]'
              )}>
                {output ? (
                  viewMode === 'tree' && parsedOutput !== null ? (
                    <JsonTreeView data={parsedOutput} />
                  ) : (
                    <pre className="font-mono text-sm whitespace-pre-wrap">{output}</pre>
                  )
                ) : (
                  <span className="text-muted-foreground">Output will appear here...</span>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ConvertPanel({ input }: { input: string }) {
  const [to, setTo] = useState<'yaml' | 'toml'>('yaml');
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleConvert = () => {
    try {
      const converted = json.convert(input, { from: 'json', to });
      setResult(converted);
      setError(null);
      toast.success(`Converted to ${to.toUpperCase()}`);
    } catch (e) {
      setError((e as Error).message);
      toast.error('Conversion failed');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Convert Format</CardTitle>
        <CardDescription>Convert JSON to other formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Select value={to} onValueChange={(v) => setTo(v as 'yaml' | 'toml')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="toml">TOML</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleConvert}>Convert</Button>
        </div>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {result && (
          <ScrollArea className="h-[200px] rounded-md border bg-muted/50 p-4">
            <pre className="font-mono text-sm">{result}</pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function QueryPanel({ input }: { input: string }) {
  const [path, setPath] = useState('$');
  const [dialect, setDialect] = useState<'jsonpath' | 'jmespath'>('jsonpath');
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleQuery = () => {
    try {
      const queryResult = json.query(input, path, { dialect });
      setResult(JSON.stringify(queryResult, null, 2));
      setError(null);
      toast.success('Query executed');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Query failed');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Query</CardTitle>
        <CardDescription>Query JSON using JSONPath or JMESPath</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="$.store.book[*].author"
            className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm"
          />
          <Select value={dialect} onValueChange={(v) => setDialect(v as 'jsonpath' | 'jmespath')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jsonpath">JSONPath</SelectItem>
              <SelectItem value="jmespath">JMESPath</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleQuery}>Query</Button>
        </div>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {result && (
          <ScrollArea className="h-[200px] rounded-md border bg-muted/50 p-4">
            <pre className="font-mono text-sm">{result}</pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function DiffPanel() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState<json.DiffResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDiff = () => {
    try {
      const diffResult = json.diff(a, b);
      setResult(diffResult);
      setError(null);
      toast.success('Diff computed');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Diff failed');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Diff</CardTitle>
        <CardDescription>Compare two JSON documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Document A</label>
            <Textarea
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder='{"key": "value"}'
              className="h-[150px] font-mono text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Document B</label>
            <Textarea
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder='{"key": "new_value"}'
              className="h-[150px] font-mono text-sm"
            />
          </div>
        </div>

        <Button onClick={handleDiff}>Compare</Button>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <span className={result.identical ? 'text-green-600' : 'text-amber-600'}>
                {result.identical ? 'Documents are identical' : 'Documents differ'}
              </span>
              {!result.identical && (
                <span className="text-muted-foreground">
                  +{result.summary.added} -{result.summary.removed} ~{result.summary.changed}
                </span>
              )}
            </div>

            {!result.identical && (
              <ScrollArea className="h-[200px] rounded-md border bg-muted/50 p-4">
                <pre className="font-mono text-sm">
                  {JSON.stringify(result.operations, null, 2)}
                </pre>
              </ScrollArea>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SchemaValidatePanel({ input }: { input: string }) {
  const [schema, setSchema] = useState('');
  const [result, setResult] = useState<json.SchemaValidationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = () => {
    try {
      const validationResult = json.validateWithSummary(input, schema);
      setResult(validationResult);
      setError(null);
      if (validationResult.valid) {
        toast.success('Schema validation passed');
      } else {
        toast.error(`Validation failed with ${validationResult.errorCount} error(s)`);
      }
    } catch (e) {
      setError((e as Error).message);
      toast.error('Schema validation failed');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Schema Validate</CardTitle>
        <CardDescription>
          Validate JSON against a schema with detailed coverage and fix suggestions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">JSON Schema</label>
          <Textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder='{"type": "object", "properties": {...}, "required": [...]}'
            className="h-[150px] font-mono text-sm"
          />
        </div>

        <Button onClick={handleValidate}>Validate</Button>

        {error && (
          <div className="text-sm text-destructive">{error}</div>
        )}

        {result && (
          <div className="space-y-4">
            <div className={cn(
              'flex items-start gap-2 rounded-lg border p-3 text-sm',
              result.valid
                ? 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400'
                : 'border-destructive/50 bg-destructive/10 text-destructive'
            )}>
              {result.valid ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{result.summary}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Total Properties</div>
                <div className="text-lg font-semibold">{result.coverage.totalProperties}</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Valid Properties</div>
                <div className="text-lg font-semibold">{result.coverage.validProperties}</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Missing Required</div>
                <div className="text-lg font-semibold">{result.coverage.missingRequired.length}</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Errors</div>
                <div className="text-lg font-semibold">{result.errorCount}</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Errors</h4>
                {result.errors.map((err, i) => (
                  <div key={i} className="rounded-lg border bg-muted/50 p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-1 py-0.5 text-xs">{err.path}</code>
                      <span className="text-muted-foreground">{err.message}</span>
                    </div>
                    <div className="mt-1 text-xs text-primary">{err.suggestion}</div>
                  </div>
                ))}
              </div>
            )}

            {result.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Suggestions</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {result.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
