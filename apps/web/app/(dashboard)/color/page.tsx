'use client';

import { useState, useCallback } from 'react';
import * as color from '@agent-tools/core/color';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';

export default function ColorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Color Utilities</h1>
          <p className="text-muted-foreground">
            Parse, convert, contrast check, palette generation, and blending
          </p>
          <ToolEnableToggle toolId="color" />
        </div>
        <AIIntegrationBadge tool="color" />
      </div>

      <Tabs defaultValue="parse" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parse">Parse</TabsTrigger>
          <TabsTrigger value="contrast">Contrast</TabsTrigger>
          <TabsTrigger value="palette">Palette</TabsTrigger>
          <TabsTrigger value="blend">Blend</TabsTrigger>
          <TabsTrigger value="name">Name</TabsTrigger>
        </TabsList>

        <TabsContent value="parse">
          <ParsePanel />
        </TabsContent>
        <TabsContent value="contrast">
          <ContrastPanel />
        </TabsContent>
        <TabsContent value="palette">
          <PalettePanel />
        </TabsContent>
        <TabsContent value="blend">
          <BlendPanel />
        </TabsContent>
        <TabsContent value="name">
          <NamePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ColorSwatch({ hex, size = 'md' }: { hex: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'h-8 w-8', md: 'h-12 w-12', lg: 'h-16 w-16' };
  return (
    <div
      className={`${sizeClasses[size]} rounded-lg border shadow-sm`}
      style={{ backgroundColor: hex }}
    />
  );
}

function ParsePanel() {
  const [input, setInput] = useState('#3498db');
  const [result, setResult] = useState<color.ColorConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleParse = useCallback(() => {
    try {
      setResult(color.parseColor(input));
      setError(null);
      toast.success('Parsed');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Parse failed');
    }
  }, [input]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Parse & Convert Color</CardTitle>
        <CardDescription>Parse any color format and see all representations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="#3498db or rgb(52,152,219) or hsl(204,70%,53%)"
            className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm font-mono"
          />
          <Button onClick={handleParse}>Parse</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="flex items-start gap-6">
            <ColorSwatch hex={result.hex} size="lg" />
            <div className="grid gap-3 sm:grid-cols-3 flex-1">
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">HEX</div>
                <div className="font-mono text-sm font-semibold">{result.hex}</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">RGB</div>
                <div className="font-mono text-sm font-semibold">{result.rgb}</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">HSL</div>
                <div className="font-mono text-sm font-semibold">{result.hsl}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ContrastPanel() {
  const [c1, setC1] = useState('#000000');
  const [c2, setC2] = useState('#FFFFFF');
  const [result, setResult] = useState<color.ContrastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = useCallback(() => {
    try {
      setResult(color.contrastRatio(c1, c2));
      setError(null);
      toast.success('Checked');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Check failed');
    }
  }, [c1, c2]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Contrast Ratio</CardTitle>
        <CardDescription>Check WCAG 2.1 contrast compliance between two colors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={c1}
              onChange={(e) => setC1(e.target.value)}
              className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm font-mono"
            />
          </div>
          <span className="text-sm text-muted-foreground">vs</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={c2}
              onChange={(e) => setC2(e.target.value)}
              className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm font-mono"
            />
          </div>
          <Button onClick={handleCheck}>Check</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <ColorSwatch hex={c1} />
              <ColorSwatch hex={c2} />
              <div className="text-2xl font-bold">{result.formatted}</div>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className={`rounded-lg border p-3 ${result.aa.normal ? 'bg-green-500/10 border-green-500/50' : 'bg-destructive/10 border-destructive/50'}`}>
                <div className="text-xs text-muted-foreground">AA Normal</div>
                <div className="font-semibold">{result.aa.normal ? 'Pass' : 'Fail'}</div>
              </div>
              <div className={`rounded-lg border p-3 ${result.aa.large ? 'bg-green-500/10 border-green-500/50' : 'bg-destructive/10 border-destructive/50'}`}>
                <div className="text-xs text-muted-foreground">AA Large</div>
                <div className="font-semibold">{result.aa.large ? 'Pass' : 'Fail'}</div>
              </div>
              <div className={`rounded-lg border p-3 ${result.aaa.normal ? 'bg-green-500/10 border-green-500/50' : 'bg-destructive/10 border-destructive/50'}`}>
                <div className="text-xs text-muted-foreground">AAA Normal</div>
                <div className="font-semibold">{result.aaa.normal ? 'Pass' : 'Fail'}</div>
              </div>
              <div className={`rounded-lg border p-3 ${result.aaa.large ? 'bg-green-500/10 border-green-500/50' : 'bg-destructive/10 border-destructive/50'}`}>
                <div className="text-xs text-muted-foreground">AAA Large</div>
                <div className="font-semibold">{result.aaa.large ? 'Pass' : 'Fail'}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PalettePanel() {
  const [base, setBase] = useState('#3498db');
  const [type, setType] = useState<color.PaletteType>('analogous');
  const [count, setCount] = useState(5);
  const [result, setResult] = useState<color.ColorConversionResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(() => {
    try {
      setResult(color.generatePalette(base, { type, count }));
      setError(null);
      toast.success('Palette generated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Generation failed');
    }
  }, [base, type, count]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Palette Generator</CardTitle>
        <CardDescription>Generate color palettes from a base color</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            placeholder="#3498db"
            className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm font-mono"
          />
          <Select value={type} onValueChange={(v) => setType(v as color.PaletteType)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="complementary">Complementary</SelectItem>
              <SelectItem value="analogous">Analogous</SelectItem>
              <SelectItem value="triadic">Triadic</SelectItem>
              <SelectItem value="shades">Shades</SelectItem>
              <SelectItem value="tints">Tints</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Count:</span>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 5)}
              className="w-16 rounded-md border bg-transparent px-3 py-2 text-sm"
              min={2}
              max={10}
            />
          </div>
          <Button onClick={handleGenerate}>Generate</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="space-y-3">
            <div className="flex gap-2">
              {result.map((c, i) => (
                <ColorSwatch key={i} hex={c.hex} size="lg" />
              ))}
            </div>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {result.map((c, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border bg-muted/50 p-2">
                  <ColorSwatch hex={c.hex} size="sm" />
                  <div className="text-xs font-mono">
                    <div>{c.hex}</div>
                    <div className="text-muted-foreground">{c.rgb}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BlendPanel() {
  const [c1, setC1] = useState('#FF0000');
  const [c2, setC2] = useState('#0000FF');
  const [ratio, setRatio] = useState(0.5);
  const [result, setResult] = useState<color.BlendResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBlend = useCallback(() => {
    try {
      setResult(color.blendColors(c1, c2, ratio));
      setError(null);
      toast.success('Blended');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Blend failed');
    }
  }, [c1, c2, ratio]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Blend Colors</CardTitle>
        <CardDescription>Mix two colors at a given ratio</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={c1}
            onChange={(e) => setC1(e.target.value)}
            className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm font-mono"
          />
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={ratio}
            onChange={(e) => setRatio(parseFloat(e.target.value))}
            className="w-40"
          />
          <span className="text-sm text-muted-foreground">{(ratio * 100).toFixed(0)}%</span>
          <input
            type="text"
            value={c2}
            onChange={(e) => setC2(e.target.value)}
            className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm font-mono"
          />
          <Button onClick={handleBlend}>Blend</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="flex items-center gap-6">
            <ColorSwatch hex={c1} />
            <span className="text-muted-foreground">+</span>
            <ColorSwatch hex={c2} />
            <span className="text-muted-foreground">=</span>
            <ColorSwatch hex={result.color.hex} size="lg" />
            <div className="font-mono text-sm">
              <div>{result.color.hex}</div>
              <div className="text-muted-foreground">{result.color.rgb}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NamePanel() {
  const [input, setInput] = useState('#FF6347');
  const [result, setResult] = useState<color.ColorNameResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleName = useCallback(() => {
    try {
      setResult(color.colorName(input));
      setError(null);
      toast.success('Identified');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Identification failed');
    }
  }, [input]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Color Name</CardTitle>
        <CardDescription>Find the nearest CSS named color</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="#FF6347"
            className="w-40 rounded-md border bg-transparent px-3 py-2 text-sm font-mono"
          />
          <Button onClick={handleName}>Identify</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="flex items-center gap-4">
            <ColorSwatch hex={result.hex} size="lg" />
            <div>
              <div className="text-lg font-semibold capitalize">{result.name}</div>
              <div className="text-sm text-muted-foreground">
                {result.exact ? 'Exact match' : 'Nearest match'} — {result.hex}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
