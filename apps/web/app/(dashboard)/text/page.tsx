'use client';

import { useState, useCallback } from 'react';
import * as text from '@atmaticai/agent-tools/text';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';

export default function TextPage() {
  const [input, setInput] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Text Utilities</h1>
          <p className="text-muted-foreground">
            Case conversion, slugify, stats, truncation, and more
          </p>
          <ToolEnableToggle toolId="text" />
        </div>
        <AIIntegrationBadge tool="text" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Input Text</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setInput('')}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter text to process..."
            className="h-[150px] font-mono text-sm resize-none"
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="case" className="space-y-4">
        <TabsList>
          <TabsTrigger value="case">Case</TabsTrigger>
          <TabsTrigger value="slugify">Slugify</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="truncate">Truncate</TabsTrigger>
          <TabsTrigger value="lorem">Lorem</TabsTrigger>
          <TabsTrigger value="similarity">Similarity</TabsTrigger>
          <TabsTrigger value="template">Template</TabsTrigger>
        </TabsList>

        <TabsContent value="case">
          <CasePanel input={input} />
        </TabsContent>
        <TabsContent value="slugify">
          <SlugifyPanel input={input} />
        </TabsContent>
        <TabsContent value="stats">
          <StatsPanel input={input} />
        </TabsContent>
        <TabsContent value="truncate">
          <TruncatePanel input={input} />
        </TabsContent>
        <TabsContent value="lorem">
          <LoremPanel />
        </TabsContent>
        <TabsContent value="similarity">
          <SimilarityPanel />
        </TabsContent>
        <TabsContent value="template">
          <TemplatePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CasePanel({ input }: { input: string }) {
  const [to, setTo] = useState<text.CaseType>('camel');
  const [result, setResult] = useState('');

  const handleConvert = useCallback(() => {
    try {
      setResult(text.convertCase(input, to));
      toast.success('Converted');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [input, to]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Case Conversion</CardTitle>
        <CardDescription>Convert text between case formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Select value={to} onValueChange={(v) => setTo(v as text.CaseType)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="camel">camelCase</SelectItem>
              <SelectItem value="snake">snake_case</SelectItem>
              <SelectItem value="kebab">kebab-case</SelectItem>
              <SelectItem value="pascal">PascalCase</SelectItem>
              <SelectItem value="title">Title Case</SelectItem>
              <SelectItem value="sentence">Sentence case</SelectItem>
              <SelectItem value="upper">UPPER CASE</SelectItem>
              <SelectItem value="lower">lower case</SelectItem>
              <SelectItem value="constant">CONSTANT_CASE</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleConvert}>Convert</Button>
        </div>
        {result && (
          <ScrollArea className="h-[100px] rounded-md border bg-muted/50 p-4">
            <pre className="font-mono text-sm">{result}</pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function SlugifyPanel({ input }: { input: string }) {
  const [separator, setSeparator] = useState('-');
  const [result, setResult] = useState('');

  const handleSlugify = useCallback(() => {
    try {
      setResult(text.slugify(input, separator));
      toast.success('Slugified');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [input, separator]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Slugify</CardTitle>
        <CardDescription>Convert text to URL-friendly slug</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Separator:</span>
            <input
              type="text"
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              className="w-16 rounded-md border bg-transparent px-3 py-2 text-sm"
              maxLength={1}
            />
          </div>
          <Button onClick={handleSlugify}>Slugify</Button>
        </div>
        {result && (
          <div className="rounded-md border bg-muted/50 p-4">
            <code className="font-mono text-sm">{result}</code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatsPanel({ input }: { input: string }) {
  const [result, setResult] = useState<text.TextStats | null>(null);

  const handleStats = useCallback(() => {
    try {
      setResult(text.getTextStats(input));
      toast.success('Stats computed');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [input]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Text Statistics</CardTitle>
        <CardDescription>Character, word, sentence, and reading time analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleStats}>Analyze</Button>
        {result && (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Characters</div>
              <div className="text-lg font-semibold">{result.characters}</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Words</div>
              <div className="text-lg font-semibold">{result.words}</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Sentences</div>
              <div className="text-lg font-semibold">{result.sentences}</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Paragraphs</div>
              <div className="text-lg font-semibold">{result.paragraphs}</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Lines</div>
              <div className="text-lg font-semibold">{result.lines}</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Reading Time</div>
              <div className="text-lg font-semibold">{Math.ceil(result.readingTimeMs / 1000)}s</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TruncatePanel({ input }: { input: string }) {
  const [length, setLength] = useState(100);
  const [boundary, setBoundary] = useState<'word' | 'character'>('word');
  const [result, setResult] = useState('');

  const handleTruncate = useCallback(() => {
    try {
      setResult(text.truncate(input, { length, boundary }));
      toast.success('Truncated');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [input, length, boundary]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Truncate</CardTitle>
        <CardDescription>Truncate text to a specified length</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Length:</span>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value) || 0)}
              className="w-20 rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <Select value={boundary} onValueChange={(v) => setBoundary(v as 'word' | 'character')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="word">Word</SelectItem>
              <SelectItem value="character">Character</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleTruncate}>Truncate</Button>
        </div>
        {result && (
          <div className="rounded-md border bg-muted/50 p-4">
            <pre className="font-mono text-sm whitespace-pre-wrap">{result}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function LoremPanel() {
  const [count, setCount] = useState(5);
  const [unit, setUnit] = useState<'words' | 'sentences' | 'paragraphs'>('words');
  const [result, setResult] = useState('');

  const handleGenerate = useCallback(() => {
    setResult(text.generateLorem(count, unit));
    toast.success('Generated');
  }, [count, unit]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Lorem Ipsum</CardTitle>
        <CardDescription>Generate placeholder text</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Count:</span>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-20 rounded-md border bg-transparent px-3 py-2 text-sm"
              min={1}
            />
          </div>
          <Select value={unit} onValueChange={(v) => setUnit(v as 'words' | 'sentences' | 'paragraphs')}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="words">Words</SelectItem>
              <SelectItem value="sentences">Sentences</SelectItem>
              <SelectItem value="paragraphs">Paragraphs</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate}>Generate</Button>
        </div>
        {result && (
          <ScrollArea className="h-[200px] rounded-md border bg-muted/50 p-4">
            <pre className="font-mono text-sm whitespace-pre-wrap">{result}</pre>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function SimilarityPanel() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [result, setResult] = useState<text.SimilarityResult | null>(null);

  const handleCompare = useCallback(() => {
    try {
      setResult(text.similarity(a, b));
      toast.success('Compared');
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [a, b]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Similarity</CardTitle>
        <CardDescription>Compare two strings using Levenshtein distance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">String A</label>
            <Textarea
              value={a}
              onChange={(e) => setA(e.target.value)}
              placeholder="First string"
              className="h-[100px] font-mono text-sm"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">String B</label>
            <Textarea
              value={b}
              onChange={(e) => setB(e.target.value)}
              placeholder="Second string"
              className="h-[100px] font-mono text-sm"
            />
          </div>
        </div>
        <Button onClick={handleCompare}>Compare</Button>
        {result && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Levenshtein Distance</div>
              <div className="text-lg font-semibold">{result.distance}</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Similarity</div>
              <div className="text-lg font-semibold">{(result.similarity * 100).toFixed(1)}%</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TemplatePanel() {
  const [template, setTemplate] = useState('');
  const [varsInput, setVarsInput] = useState('');
  const [result, setResult] = useState<text.TemplateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInterpolate = useCallback(() => {
    try {
      let variables: Record<string, string> = {};
      if (varsInput.trim()) {
        variables = JSON.parse(varsInput);
      }
      const res = text.interpolate(template, variables);
      setResult(res);
      setError(null);
      toast.success('Interpolated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Interpolation failed');
    }
  }, [template, varsInput]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Template Interpolation</CardTitle>
        <CardDescription>Replace {'{{key}}'} placeholders with variable values</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Template</label>
          <Textarea
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="Hello {{name}}, welcome to {{place}}!"
            className="h-[100px] font-mono text-sm"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Variables (JSON)</label>
          <Textarea
            value={varsInput}
            onChange={(e) => setVarsInput(e.target.value)}
            placeholder='{"name": "World", "place": "Earth"}'
            className="h-[80px] font-mono text-sm"
          />
        </div>
        <Button onClick={handleInterpolate}>Interpolate</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="space-y-3">
            <div className="rounded-md border bg-muted/50 p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap">{result.result}</pre>
            </div>
            {result.missingKeys.length > 0 && (
              <div className="text-sm text-amber-600">
                Missing keys: {result.missingKeys.join(', ')}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
