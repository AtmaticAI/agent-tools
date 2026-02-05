'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Braces,
  Lock,
  Database,
  Regex,
  GitCompare,
  Table2,
  Clock,
  FileType,
  Code2,
  FileText,
  FileSpreadsheet,
  Image,
  Archive,
  Type,
  Calculator,
  Palette,
  Search,
  X,
  Shield,
  Workflow,
  Zap,
} from 'lucide-react';

const allTools = [
  { id: 'json', title: 'JSON Studio', description: 'Format, validate, query, convert, and diff JSON documents', href: '/json', icon: Braces },
  { id: 'crypto', title: 'Crypto & Encoding', description: 'Hash, encode, decode, and work with JWTs', href: '/crypto', icon: Lock },
  { id: 'sql', title: 'SQL Studio', description: 'Format, parse, and validate SQL queries', href: '/sql', icon: Database },
  { id: 'regex', title: 'Regex Tester', description: 'Test, replace, and extract with regular expressions', href: '/regex', icon: Regex },
  { id: 'diff', title: 'Diff & Patch', description: 'Compare texts and apply unified diffs', href: '/diff', icon: GitCompare },
  { id: 'csv', title: 'CSV Viewer', description: 'Parse, filter, convert, and analyze CSV data', href: '/csv', icon: Table2 },
  { id: 'datetime', title: 'Date/Time Tools', description: 'Parse, format, convert timezones, and analyze cron expressions', href: '/datetime', icon: Clock },
  { id: 'markdown', title: 'Markdown Studio', description: 'Convert, generate TOC, and analyze Markdown documents', href: '/markdown', icon: FileType },
  { id: 'xml', title: 'XML Studio', description: 'Parse, format, validate, and convert XML documents', href: '/xml', icon: Code2 },
  { id: 'pdf', title: 'PDF Toolkit', description: 'Merge, split, extract text, and generate PDFs', href: '/pdf', icon: FileText },
  { id: 'excel', title: 'Excel Viewer', description: 'Parse, convert, and analyze Excel workbooks', href: '/excel', icon: FileSpreadsheet },
  { id: 'image', title: 'Image Toolkit', description: 'Resize, convert, and extract metadata from images', href: '/image', icon: Image },
  { id: 'archive', title: 'Archive Manager', description: 'Create, extract, and list archive contents', href: '/archive', icon: Archive },
  { id: 'text', title: 'Text Utilities', description: 'Case conversion, slugify, word count, similarity, and template interpolation', href: '/text', icon: Type },
  { id: 'math', title: 'Math Utilities', description: 'Unit conversion, base conversion, statistics, and number formatting', href: '/math', icon: Calculator },
  { id: 'color', title: 'Color Utilities', description: 'Color parsing, conversion, contrast checking, palette generation, and blending', href: '/color', icon: Palette },
];

const features = [
  {
    title: 'Deterministic',
    description: 'Guaranteed correct output, every time',
    icon: Shield,
  },
  {
    title: 'Agent-Ready',
    description: 'Built for MCP and A2A integration',
    icon: Workflow,
  },
  {
    title: 'Enterprise-Grade',
    description: 'Handles large files with ease',
    icon: Zap,
  },
];

export default function HomePage() {
  const [enabledTools, setEnabledTools] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setEnabledTools(data.enabled ?? {}))
      .catch(() => {});
  }, []);

  const filteredTools = useMemo(() => {
    if (!search.trim()) return allTools;
    const q = search.toLowerCase();
    return allTools.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme(spacing.14)-theme(spacing.6)*2)]">
      {/* Hero Section - 35% height with centered search */}
      <div className="flex flex-col items-center justify-center py-16">
        <h1 className="text-4xl font-bold tracking-tight text-center">
          Deterministic Data Tools
        </h1>
        <p className="mt-3 text-lg text-muted-foreground text-center max-w-xl">
          Agent-driven platform for data transformation. Built for MCP and A2A systems.
        </p>

        {/* Search - floating with shadow */}
        <div className="mt-10 w-full max-w-xl">
          <div className="relative rounded-2xl bg-background shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-14 w-full rounded-2xl bg-transparent pl-14 pr-14 text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tools Grid - scrollable */}
      <div className="flex-1">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTools.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-12">
              No tools found matching "{search}"
            </p>
          )}
          {filteredTools.map((tool) => {
            const isEnabled = enabledTools[tool.id] ?? true;
            return (
              <Link key={tool.id} href={tool.href}>
                <Card className={`h-full transition-colors hover:bg-muted/50 hover:border-primary/30 ${!isEnabled ? 'opacity-50' : ''}`}>
                  <CardHeader className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <tool.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-sm font-semibold">{tool.title}</CardTitle>
                          {!isEnabled && (
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                          )}
                        </div>
                        <CardDescription className="mt-1 text-xs line-clamp-2">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-12 pt-8 border-t">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 rounded-xl border bg-card p-5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer tagline */}
      <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
        <span className="font-medium">LLMs think. Agent Tools executes.</span>
        <span className="mx-2">·</span>
        <a href="https://atmatic.ai" className="hover:underline">atmatic.ai</a>
      </div>
    </div>
  );
}
