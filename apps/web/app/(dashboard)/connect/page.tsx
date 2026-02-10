'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Copy, Check, Terminal, Globe, Cpu } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';

const mcpConfig = `{
  "mcpServers": {
    "agent-tools": {
      "command": "npx",
      "args": ["@atmaticai/agent-tools"]
    }
  }
}`;

const mcpHttpConfig = `# Start HTTP streaming server
npx @atmaticai/agent-tools --transport http --port 3001

# Then connect via:
POST http://localhost:3001/mcp
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 1
}`;

const a2aExample = `# Discover agent capabilities
curl https://your-agent-tools-instance/.well-known/agent.json

# Create a task
curl -X POST https://your-agent-tools-instance/a2a/tasks \\
  -H "Content-Type: application/json" \\
  -d '{
    "skill": "json-operations",
    "input": {
      "action": "format",
      "data": "{\\"a\\":1}"
    }
  }'

# Poll for result
curl https://your-agent-tools-instance/a2a/tasks/{task_id}`;

const tools = [
  {
    category: 'JSON',
    items: [
      { name: 'agent_tools_json_format', description: 'Format JSON with options' },
      { name: 'agent_tools_json_validate', description: 'Validate against JSON Schema' },
      { name: 'agent_tools_json_query', description: 'Query with JSONPath/JMESPath' },
      { name: 'agent_tools_json_convert', description: 'Convert between formats' },
      { name: 'agent_tools_json_diff', description: 'Compare two JSON documents' },
      { name: 'agent_tools_json_minify', description: 'Minify JSON' },
      { name: 'agent_tools_json_stats', description: 'Get JSON statistics' },
    ],
  },
  {
    category: 'CSV',
    items: [
      { name: 'agent_tools_csv_parse', description: 'Parse CSV to JSON' },
      { name: 'agent_tools_csv_to_json', description: 'Convert CSV to JSON' },
      { name: 'agent_tools_csv_filter', description: 'Filter CSV rows' },
      { name: 'agent_tools_csv_stats', description: 'Get column statistics' },
      { name: 'agent_tools_csv_transform', description: 'Transform CSV columns' },
      { name: 'agent_tools_csv_export', description: 'Export to different formats' },
    ],
  },
  {
    category: 'PDF',
    items: [
      { name: 'agent_tools_pdf_merge', description: 'Merge PDF files' },
      { name: 'agent_tools_pdf_split', description: 'Split PDF by ranges' },
      { name: 'agent_tools_pdf_extract_pages', description: 'Extract specific pages' },
      { name: 'agent_tools_pdf_extract_text', description: 'Extract text from PDF' },
      { name: 'agent_tools_pdf_metadata', description: 'Get/set PDF metadata' },
      { name: 'agent_tools_pdf_rotate', description: 'Rotate pages' },
      { name: 'agent_tools_pdf_compress', description: 'Compress PDF' },
    ],
  },
  {
    category: 'XML',
    items: [
      { name: 'agent_tools_xml_parse', description: 'Parse XML to JSON' },
      { name: 'agent_tools_xml_format', description: 'Format/pretty-print XML' },
      { name: 'agent_tools_xml_minify', description: 'Minify XML' },
      { name: 'agent_tools_xml_validate', description: 'Validate XML structure' },
      { name: 'agent_tools_xml_query', description: 'Query XML with path expressions' },
      { name: 'agent_tools_xml_convert', description: 'Convert between XML and JSON' },
      { name: 'agent_tools_xml_stats', description: 'Get XML statistics' },
    ],
  },
  {
    category: 'Excel',
    items: [
      { name: 'agent_tools_excel_parse', description: 'Parse Excel to structured data' },
      { name: 'agent_tools_excel_convert', description: 'Convert to JSON/CSV/TSV' },
      { name: 'agent_tools_excel_stats', description: 'Get workbook statistics' },
      { name: 'agent_tools_excel_sheets', description: 'List sheet names and info' },
      { name: 'agent_tools_excel_create', description: 'Create Excel from JSON data' },
    ],
  },
  {
    category: 'Image',
    items: [
      { name: 'agent_tools_image_resize', description: 'Resize images with fit options' },
      { name: 'agent_tools_image_crop', description: 'Crop images to region' },
      { name: 'agent_tools_image_convert', description: 'Convert between formats' },
      { name: 'agent_tools_image_compress', description: 'Compress images' },
      { name: 'agent_tools_image_rotate', description: 'Rotate images' },
      { name: 'agent_tools_image_metadata', description: 'Extract image metadata' },
      { name: 'agent_tools_image_grayscale', description: 'Convert to grayscale' },
    ],
  },
  {
    category: 'Markdown',
    items: [
      { name: 'agent_tools_markdown_convert', description: 'Convert between Markdown/HTML/text' },
      { name: 'agent_tools_markdown_toc', description: 'Generate table of contents' },
      { name: 'agent_tools_markdown_links', description: 'Extract all links' },
      { name: 'agent_tools_markdown_frontmatter', description: 'Extract frontmatter' },
      { name: 'agent_tools_markdown_stats', description: 'Get document statistics' },
    ],
  },
  {
    category: 'Archive',
    items: [
      { name: 'agent_tools_archive_create', description: 'Create ZIP archives' },
      { name: 'agent_tools_archive_extract', description: 'Extract archive contents' },
      { name: 'agent_tools_archive_list', description: 'List archive entries' },
      { name: 'agent_tools_archive_stats', description: 'Get archive statistics' },
    ],
  },
  {
    category: 'Regex',
    items: [
      { name: 'agent_tools_regex_test', description: 'Test pattern against text' },
      { name: 'agent_tools_regex_replace', description: 'Search and replace with regex' },
      { name: 'agent_tools_regex_extract', description: 'Extract matching groups' },
      { name: 'agent_tools_regex_validate', description: 'Validate regex pattern syntax' },
    ],
  },
  {
    category: 'Diff',
    items: [
      { name: 'agent_tools_diff_compare', description: 'Compare texts (line/word/char)' },
      { name: 'agent_tools_diff_unified', description: 'Generate unified diff format' },
      { name: 'agent_tools_diff_apply', description: 'Apply patches to text' },
    ],
  },
  {
    category: 'SQL',
    items: [
      { name: 'agent_tools_sql_format', description: 'Format SQL queries' },
      { name: 'agent_tools_sql_minify', description: 'Minify SQL' },
      { name: 'agent_tools_sql_parse', description: 'Parse SQL to AST' },
      { name: 'agent_tools_sql_validate', description: 'Validate SQL syntax' },
      { name: 'agent_tools_sql_convert', description: 'Convert between SQL dialects' },
      { name: 'agent_tools_sql_stats', description: 'Get query statistics' },
    ],
  },
  {
    category: 'Crypto & Encoding',
    items: [
      { name: 'agent_tools_crypto_hash', description: 'Hash text (MD5, SHA-256, etc.)' },
      { name: 'agent_tools_crypto_hmac', description: 'Generate HMAC signatures' },
      { name: 'agent_tools_crypto_encode', description: 'Encode (Base64, Hex, URL, HTML)' },
      { name: 'agent_tools_crypto_decode', description: 'Decode encoded text' },
      { name: 'agent_tools_crypto_jwt_decode', description: 'Decode JWT tokens' },
      { name: 'agent_tools_crypto_uuid', description: 'Generate UUID v4' },
      { name: 'agent_tools_crypto_checksum', description: 'Compute file checksums' },
    ],
  },
  {
    category: 'Date/Time',
    items: [
      { name: 'agent_tools_datetime_parse', description: 'Parse date strings' },
      { name: 'agent_tools_datetime_format', description: 'Format dates' },
      { name: 'agent_tools_datetime_now', description: 'Get current date/time' },
      { name: 'agent_tools_datetime_add', description: 'Add duration to dates' },
      { name: 'agent_tools_datetime_subtract', description: 'Subtract duration from dates' },
      { name: 'agent_tools_datetime_diff', description: 'Calculate date differences' },
      { name: 'agent_tools_datetime_timezone_convert', description: 'Convert between timezones' },
      { name: 'agent_tools_datetime_cron', description: 'Parse cron expressions' },
      { name: 'agent_tools_datetime_timezones', description: 'List all timezones' },
    ],
  },
];

export default function ConnectPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Connect to Agent Tools</h1>
        <p className="text-muted-foreground">
          Integrate Agent Tools tools with your agents via MCP, A2A, or REST API
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Terminal className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">MCP</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Direct tool access via stdio, SSE, or HTTP streaming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">A2A</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Agent-to-agent protocol for inter-agent communication
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-base">REST API</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Direct HTTP access to all tools
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mcp" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mcp">MCP Integration</TabsTrigger>
          <TabsTrigger value="a2a">A2A Protocol</TabsTrigger>
          <TabsTrigger value="tools">Available Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="mcp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>stdio Transport (Claude Desktop)</CardTitle>
              <CardDescription>
                Add to your Claude Desktop configuration file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={mcpConfig} language="json" />
              <p className="mt-4 text-sm text-muted-foreground">
                Location: <code className="rounded bg-muted px-1">~/.config/claude/claude_desktop_config.json</code>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>HTTP Streaming Transport</CardTitle>
              <CardDescription>
                For scalable, stateless deployments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={mcpHttpConfig} language="bash" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SSE Transport</CardTitle>
              <CardDescription>
                For web-based MCP clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`# Start SSE server
npx @atmaticai/agent-tools --transport sse --port 3001

# Connect to /sse endpoint for event stream
# Send messages to /message?clientId=xxx`}
                language="bash"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="a2a" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A2A Agent Card</CardTitle>
              <CardDescription>
                Discover agent capabilities at /.well-known/agent.json
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={JSON.stringify(
                  {
                    name: 'Agent Tools Data Agent',
                    description: 'Deterministic data transformation and document processing',
                    version: '1.0.0',
                    capabilities: { streaming: true, pushNotifications: false },
                    skills: [
                      { id: 'json-operations', name: 'JSON Processing' },
                      { id: 'csv-operations', name: 'CSV Processing' },
                      { id: 'pdf-operations', name: 'PDF Processing' },
                      { id: 'xml-operations', name: 'XML Processing' },
                      { id: 'excel-operations', name: 'Excel Processing' },
                      { id: 'image-operations', name: 'Image Processing' },
                      { id: 'markdown-operations', name: 'Markdown Processing' },
                      { id: 'archive-operations', name: 'Archive Management' },
                      { id: 'regex-operations', name: 'Regex Operations' },
                      { id: 'diff-operations', name: 'Diff & Patch' },
                      { id: 'sql-operations', name: 'SQL Processing' },
                      { id: 'crypto-operations', name: 'Crypto & Encoding' },
                      { id: 'datetime-operations', name: 'Date/Time Operations' },
                    ],
                  },
                  null,
                  2
                )}
                language="json"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Lifecycle</CardTitle>
              <CardDescription>Create and poll tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <CodeBlock code={a2aExample} language="bash" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          {tools.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle>{category.category} Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {category.items.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <code className="text-sm font-medium">{tool.name}</code>
                        <p className="text-sm text-muted-foreground">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CodeBlock({ code, language: _language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-8 w-8"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
      <ScrollArea className="h-auto max-h-[400px]">
        <pre className="rounded-lg bg-muted p-4 font-mono text-sm">
          <code>{code}</code>
        </pre>
      </ScrollArea>
    </div>
  );
}
