'use client';

import { useState, useCallback } from 'react';
import * as datetime from '@agent-tools/core/datetime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Trash2, Clock, Calendar, Globe, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

export default function DateTimePage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [timezone, setTimezone] = useState('');
  const [dateA, setDateA] = useState('');
  const [dateB, setDateB] = useState('');
  const [fromTz, setFromTz] = useState('America/New_York');
  const [toTz, setToTz] = useState('Asia/Tokyo');
  const [cronExpr, setCronExpr] = useState('');
  const [addDays, setAddDays] = useState('');
  const [addHours, setAddHours] = useState('');
  const { containerRef } = useFullscreenContainer();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const handleParse = useCallback(() => {
    try {
      const result = datetime.parseDate(input, timezone || undefined);
      setOutput(JSON.stringify(result, null, 2));
      setSidebarCollapsed(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [input, timezone, setSidebarCollapsed]);

  const handleNow = useCallback(() => {
    const result = datetime.now(timezone || undefined);
    setOutput(JSON.stringify(result, null, 2));
    setSidebarCollapsed(true);
  }, [timezone, setSidebarCollapsed]);

  const handleDiff = useCallback(() => {
    try {
      const result = datetime.diff(dateA, dateB);
      setOutput(JSON.stringify(result, null, 2));
      setSidebarCollapsed(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [dateA, dateB, setSidebarCollapsed]);

  const handleTimezone = useCallback(() => {
    try {
      const result = datetime.convertTimezone(input, fromTz, toTz);
      setOutput(JSON.stringify(result, null, 2));
      setSidebarCollapsed(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [input, fromTz, toTz, setSidebarCollapsed]);

  const handleCron = useCallback(() => {
    const result = datetime.parseCron(cronExpr);
    setOutput(JSON.stringify(result, null, 2));
    setSidebarCollapsed(true);
  }, [cronExpr, setSidebarCollapsed]);

  const handleAdd = useCallback(() => {
    try {
      const result = datetime.add(input, {
        days: addDays ? parseInt(addDays) : undefined,
        hours: addHours ? parseInt(addHours) : undefined,
      }, timezone || undefined);
      setOutput(result);
      setSidebarCollapsed(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [input, addDays, addHours, timezone, setSidebarCollapsed]);

  return (
    <main className="flex-1 overflow-auto p-6" ref={containerRef}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Date/Time Tools</h1>
            <p className="text-muted-foreground">
              Parse, format, compute, convert timezones, and analyze dates and cron expressions
            </p>
            <ToolEnableToggle toolId="datetime" />
          </div>
          <AIIntegrationBadge tool="datetime" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="parse">
                <TabsList className="w-full">
                  <TabsTrigger value="parse">
                    <Calendar className="mr-1 h-3 w-3" />
                    Parse
                  </TabsTrigger>
                  <TabsTrigger value="diff">
                    <Timer className="mr-1 h-3 w-3" />
                    Diff
                  </TabsTrigger>
                  <TabsTrigger value="timezone">
                    <Globe className="mr-1 h-3 w-3" />
                    Timezone
                  </TabsTrigger>
                  <TabsTrigger value="cron">
                    <Clock className="mr-1 h-3 w-3" />
                    Cron
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="parse" className="space-y-4 pt-4">
                  <Input
                    placeholder="2024-01-15T10:30:00Z or 1705312200"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="font-mono"
                  />
                  <Input
                    placeholder="Timezone (e.g., America/New_York)"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="font-mono"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleParse}>Parse</Button>
                    <Button onClick={handleNow} variant="outline">Now</Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Days"
                      className="w-20"
                      value={addDays}
                      onChange={(e) => setAddDays(e.target.value)}
                    />
                    <Input
                      placeholder="Hours"
                      className="w-20"
                      value={addHours}
                      onChange={(e) => setAddHours(e.target.value)}
                    />
                    <Button onClick={handleAdd} variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="diff" className="space-y-4 pt-4">
                  <Input
                    placeholder="First date (ISO)"
                    value={dateA}
                    onChange={(e) => setDateA(e.target.value)}
                    className="font-mono"
                  />
                  <Input
                    placeholder="Second date (ISO)"
                    value={dateB}
                    onChange={(e) => setDateB(e.target.value)}
                    className="font-mono"
                  />
                  <Button onClick={handleDiff}>Calculate Difference</Button>
                </TabsContent>
                <TabsContent value="timezone" className="space-y-4 pt-4">
                  <Input
                    placeholder="Date (ISO) e.g., 2024-01-15T10:30:00"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="From timezone"
                      value={fromTz}
                      onChange={(e) => setFromTz(e.target.value)}
                      className="font-mono"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      placeholder="To timezone"
                      value={toTz}
                      onChange={(e) => setToTz(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <Button onClick={handleTimezone}>Convert</Button>
                </TabsContent>
                <TabsContent value="cron" className="space-y-4 pt-4">
                  <Input
                    placeholder="*/5 * * * * (every 5 minutes)"
                    value={cronExpr}
                    onChange={(e) => setCronExpr(e.target.value)}
                    className="font-mono"
                  />
                  <Button onClick={handleCron}>Parse Cron</Button>
                </TabsContent>
              </Tabs>
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOutput('')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <FullscreenButton targetRef={containerRef} />
              </div>
            </CardHeader>
            <CardContent>
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
