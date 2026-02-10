'use client';

import { useState, useCallback } from 'react';
import * as cryptoTools from '@atmaticai/agent-tools/crypto';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
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
import { Copy, Trash2, Lock, Key, Hash, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/lib/utils';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

export default function CryptoPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [hashAlgo, setHashAlgo] = useState<'md5' | 'sha1' | 'sha256' | 'sha384' | 'sha512'>('sha256');
  const [encFormat, setEncFormat] = useState<'base64' | 'hex' | 'url' | 'html'>('base64');
  const [jwtToken, setJwtToken] = useState('');
  const { containerRef } = useFullscreenContainer();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const handleHash = useCallback(() => {
    const result = cryptoTools.hash(input, hashAlgo);
    setOutput(JSON.stringify(result, null, 2));
    setSidebarCollapsed(true);
  }, [input, hashAlgo, setSidebarCollapsed]);

  const handleEncode = useCallback(() => {
    try {
      const result = cryptoTools.encode(input, encFormat);
      setOutput(result);
      setSidebarCollapsed(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [input, encFormat, setSidebarCollapsed]);

  const handleDecode = useCallback(() => {
    try {
      const result = cryptoTools.decode(input, encFormat);
      setOutput(result);
      setSidebarCollapsed(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [input, encFormat, setSidebarCollapsed]);

  const handleJwt = useCallback(() => {
    try {
      const result = cryptoTools.decodeJwt(jwtToken);
      setOutput(JSON.stringify(result, null, 2));
      setSidebarCollapsed(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }, [jwtToken, setSidebarCollapsed]);

  const handleUuid = useCallback(() => {
    const result = cryptoTools.generateUuid();
    setOutput(JSON.stringify(result, null, 2));
    setSidebarCollapsed(true);
  }, [setSidebarCollapsed]);

  return (
    <main className="flex-1 overflow-auto p-6" ref={containerRef}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Crypto & Encoding</h1>
            <p className="text-muted-foreground">
              Hash, encode/decode, verify checksums, decode JWTs, generate UUIDs
            </p>
            <ToolEnableToggle toolId="crypto" />
          </div>
          <AIIntegrationBadge tool="crypto" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="hash">
                <TabsList className="w-full">
                  <TabsTrigger value="hash">
                    <Hash className="mr-1 h-3 w-3" />
                    Hash
                  </TabsTrigger>
                  <TabsTrigger value="encode">
                    <Lock className="mr-1 h-3 w-3" />
                    Encode
                  </TabsTrigger>
                  <TabsTrigger value="jwt">
                    <Key className="mr-1 h-3 w-3" />
                    JWT
                  </TabsTrigger>
                  <TabsTrigger value="uuid">
                    <Shield className="mr-1 h-3 w-3" />
                    UUID
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="hash" className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Enter text to hash..."
                    className="min-h-[200px] font-mono text-sm"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <div className="flex items-center gap-4">
                    <Select value={hashAlgo} onValueChange={(v) => setHashAlgo(v as typeof hashAlgo)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="md5">MD5</SelectItem>
                        <SelectItem value="sha1">SHA-1</SelectItem>
                        <SelectItem value="sha256">SHA-256</SelectItem>
                        <SelectItem value="sha384">SHA-384</SelectItem>
                        <SelectItem value="sha512">SHA-512</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleHash}>Hash</Button>
                  </div>
                </TabsContent>
                <TabsContent value="encode" className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Enter text to encode/decode..."
                    className="min-h-[200px] font-mono text-sm"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <div className="flex items-center gap-4">
                    <Select value={encFormat} onValueChange={(v) => setEncFormat(v as typeof encFormat)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base64">Base64</SelectItem>
                        <SelectItem value="hex">Hex</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleEncode}>Encode</Button>
                    <Button onClick={handleDecode} variant="outline">Decode</Button>
                  </div>
                </TabsContent>
                <TabsContent value="jwt" className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Paste JWT token here..."
                    className="min-h-[200px] font-mono text-sm"
                    value={jwtToken}
                    onChange={(e) => setJwtToken(e.target.value)}
                  />
                  <Button onClick={handleJwt}>Decode JWT</Button>
                </TabsContent>
                <TabsContent value="uuid" className="space-y-4 pt-4">
                  <p className="text-sm text-muted-foreground">
                    Generate a cryptographically secure UUID v4.
                  </p>
                  <Button onClick={handleUuid}>Generate UUID</Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Output</CardTitle>
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
                  onClick={() => {
                    setInput('');
                    setOutput('');
                    setJwtToken('');
                  }}
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
