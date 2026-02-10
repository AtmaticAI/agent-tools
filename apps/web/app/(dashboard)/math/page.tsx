'use client';

import { useState, useCallback } from 'react';
import * as math from '@atmaticai/agent-tools-core/math';
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
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';

export default function MathPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Math Utilities</h1>
          <p className="text-muted-foreground">
            Unit conversion, base conversion, statistics, and number formatting
          </p>
          <ToolEnableToggle toolId="math" />
        </div>
        <AIIntegrationBadge tool="math" />
      </div>

      <Tabs defaultValue="convert" className="space-y-4">
        <TabsList>
          <TabsTrigger value="convert">Unit Convert</TabsTrigger>
          <TabsTrigger value="base">Base Convert</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="format">Format</TabsTrigger>
          <TabsTrigger value="percentage">Percentage</TabsTrigger>
        </TabsList>

        <TabsContent value="convert">
          <UnitConvertPanel />
        </TabsContent>
        <TabsContent value="base">
          <BaseConvertPanel />
        </TabsContent>
        <TabsContent value="statistics">
          <StatisticsPanel />
        </TabsContent>
        <TabsContent value="format">
          <FormatPanel />
        </TabsContent>
        <TabsContent value="percentage">
          <PercentagePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UnitConvertPanel() {
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<math.UnitCategory>('length');
  const [from, setFrom] = useState('m');
  const [to, setTo] = useState('ft');
  const [result, setResult] = useState<math.UnitConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const units: Record<string, string[]> = {
    length: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    weight: ['mg', 'g', 'kg', 'oz', 'lb', 'ton'],
    temperature: ['celsius', 'fahrenheit', 'kelvin'],
    data: ['b', 'kb', 'mb', 'gb', 'tb'],
  };

  const handleConvert = useCallback(() => {
    try {
      const r = math.convertUnit(parseFloat(value), from, to, category);
      setResult(r);
      setError(null);
      toast.success('Converted');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Conversion failed');
    }
  }, [value, from, to, category]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Unit Conversion</CardTitle>
        <CardDescription>Convert between units of measurement</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Value:</span>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v as math.UnitCategory); setFrom(units[v][0]); setTo(units[v][1]); }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="length">Length</SelectItem>
              <SelectItem value="weight">Weight</SelectItem>
              <SelectItem value="temperature">Temperature</SelectItem>
              <SelectItem value="data">Data</SelectItem>
            </SelectContent>
          </Select>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units[category].map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">to</span>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units[category].map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleConvert}>Convert</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <span className="text-2xl font-bold">{result.result}</span>
            <span className="ml-2 text-muted-foreground">{result.to}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BaseConvertPanel() {
  const [input, setInput] = useState('');
  const [fromBase, setFromBase] = useState<math.NumberBase>('decimal');
  const [result, setResult] = useState<math.BaseConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = useCallback(() => {
    try {
      setResult(math.convertBase(input, fromBase));
      setError(null);
      toast.success('Converted');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Conversion failed');
    }
  }, [input, fromBase]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Base Conversion</CardTitle>
        <CardDescription>Convert between binary, octal, decimal, and hex</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="255"
            className="flex-1 rounded-md border bg-transparent px-3 py-2 text-sm font-mono"
          />
          <Select value={fromBase} onValueChange={(v) => setFromBase(v as math.NumberBase)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="binary">Binary</SelectItem>
              <SelectItem value="octal">Octal</SelectItem>
              <SelectItem value="decimal">Decimal</SelectItem>
              <SelectItem value="hex">Hex</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleConvert}>Convert</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Binary</div>
              <div className="font-mono text-sm font-semibold">{result.binary}</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Octal</div>
              <div className="font-mono text-sm font-semibold">{result.octal}</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Decimal</div>
              <div className="font-mono text-sm font-semibold">{result.decimal}</div>
            </div>
            <div className="rounded-lg border bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Hex</div>
              <div className="font-mono text-sm font-semibold">{result.hex}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatisticsPanel() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<math.StatisticsResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    try {
      const numbers = input.split(/[,\s\n]+/).filter(Boolean).map(Number);
      setResult(math.calculateStats(numbers));
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [input]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Statistics</CardTitle>
        <CardDescription>Calculate statistical measures for a set of numbers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter numbers separated by commas, spaces, or newlines..."
          className="h-[100px] font-mono text-sm"
        />
        <Button onClick={handleCalculate}>Calculate</Button>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Mean</div>
                <div className="text-lg font-semibold">{result.mean.toFixed(4)}</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Median</div>
                <div className="text-lg font-semibold">{result.median.toFixed(4)}</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Std Dev</div>
                <div className="text-lg font-semibold">{result.standardDeviation.toFixed(4)}</div>
              </div>
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Range</div>
                <div className="text-lg font-semibold">{result.range}</div>
              </div>
            </div>
            <ScrollArea className="h-[120px] rounded-md border bg-muted/50 p-4">
              <pre className="font-mono text-sm">{JSON.stringify(result, null, 2)}</pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FormatPanel() {
  const [value, setValue] = useState('');
  const [style, setStyle] = useState<'decimal' | 'currency' | 'percent'>('decimal');
  const [currency, setCurrency] = useState('USD');
  const [result, setResult] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFormat = useCallback(() => {
    try {
      const opts: math.NumberFormatOptions = { style };
      if (style === 'currency') opts.currency = currency;
      setResult(math.formatNumber(parseFloat(value), opts));
      setError(null);
      toast.success('Formatted');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Format failed');
    }
  }, [value, style, currency]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Number Format</CardTitle>
        <CardDescription>Format numbers with locale-aware formatting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="1234567.89"
            className="w-40 rounded-md border bg-transparent px-3 py-2 text-sm"
          />
          <Select value={style} onValueChange={(v) => setStyle(v as 'decimal' | 'currency' | 'percent')}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="decimal">Decimal</SelectItem>
              <SelectItem value="currency">Currency</SelectItem>
              <SelectItem value="percent">Percent</SelectItem>
            </SelectContent>
          </Select>
          {style === 'currency' && (
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="USD"
              className="w-20 rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          )}
          <Button onClick={handleFormat}>Format</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <span className="text-2xl font-bold">{result}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PercentagePanel() {
  const [mode, setMode] = useState<'of' | 'change'>('of');
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalc = useCallback(() => {
    try {
      if (mode === 'of') {
        const r = math.percentage(parseFloat(v1), parseFloat(v2));
        setResult(`${r.formatted} (${r.percentage.toFixed(2)}%)`);
      } else {
        const r = math.percentageChange(parseFloat(v1), parseFloat(v2));
        setResult(`${r.formatted} (${r.change.toFixed(2)}%)`);
      }
      setError(null);
      toast.success('Calculated');
    } catch (e) {
      setError((e as Error).message);
      toast.error('Calculation failed');
    }
  }, [mode, v1, v2]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Percentage</CardTitle>
        <CardDescription>Calculate percentages and percentage change</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={mode} onValueChange={(v) => setMode(v as 'of' | 'change')}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="of">% of Total</SelectItem>
              <SelectItem value="change">% Change</SelectItem>
            </SelectContent>
          </Select>
          <input
            type="number"
            value={v1}
            onChange={(e) => setV1(e.target.value)}
            placeholder={mode === 'of' ? 'Value' : 'From'}
            className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm"
          />
          <input
            type="number"
            value={v2}
            onChange={(e) => setV2(e.target.value)}
            placeholder={mode === 'of' ? 'Total' : 'To'}
            className="w-32 rounded-md border bg-transparent px-3 py-2 text-sm"
          />
          <Button onClick={handleCalc}>Calculate</Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
        {result && (
          <div className="rounded-lg border bg-muted/50 p-4">
            <span className="text-2xl font-bold">{result}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
