'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui-store';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Braces,
  Table2,
  FileText,
  Plug,
  Home,
  PanelLeftClose,
  PanelLeft,
  Code2,
  FileSpreadsheet,
  Image,
  FileType,
  Archive,
  Regex,
  GitCompare,
  Database,
  Lock,
  Clock,
  Settings,
  Type,
  Calculator,
  Palette,
  Search,
  X,
} from 'lucide-react';

const pinnedNav = [
  { name: 'Home', href: '/', icon: Home, toolId: null },
  { name: 'Connect', href: '/connect', icon: Plug, toolId: null },
  { name: 'Customize', href: '/settings', icon: Settings, toolId: null },
];

const tools = [
  { name: 'JSON Studio', href: '/json', icon: Braces, toolId: 'json' },
  { name: 'Crypto & Encoding', href: '/crypto', icon: Lock, toolId: 'crypto' },
  { name: 'SQL Studio', href: '/sql', icon: Database, toolId: 'sql' },
  { name: 'Regex Tester', href: '/regex', icon: Regex, toolId: 'regex' },
  { name: 'Diff & Patch', href: '/diff', icon: GitCompare, toolId: 'diff' },
  { name: 'CSV Viewer', href: '/csv', icon: Table2, toolId: 'csv' },
  { name: 'Date/Time Tools', href: '/datetime', icon: Clock, toolId: 'datetime' },
  { name: 'Markdown Studio', href: '/markdown', icon: FileType, toolId: 'markdown' },
  { name: 'XML Studio', href: '/xml', icon: Code2, toolId: 'xml' },
  { name: 'PDF Toolkit', href: '/pdf', icon: FileText, toolId: 'pdf' },
  { name: 'Excel Viewer', href: '/excel', icon: FileSpreadsheet, toolId: 'excel' },
  { name: 'Image Toolkit', href: '/image', icon: Image, toolId: 'image' },
  { name: 'Archive Manager', href: '/archive', icon: Archive, toolId: 'archive' },
  { name: 'Text Utilities', href: '/text', icon: Type, toolId: 'text' },
  { name: 'Math Utilities', href: '/math', icon: Calculator, toolId: 'math' },
  { name: 'Color Utilities', href: '/color', icon: Palette, toolId: 'color' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [enabledTools, setEnabledTools] = useState<Record<string, boolean> | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => setEnabledTools(data.enabled ?? null))
      .catch(() => {});
  }, [pathname]);

  const filteredTools = useMemo(() => {
    if (!search.trim()) return tools;
    const q = search.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.toolId && t.toolId.toLowerCase().includes(q))
    );
  }, [search]);

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  }

  function renderNavItem(item: (typeof pinnedNav)[0], showLabel: boolean) {
    const active = isActive(item.href);
    const isDisabled =
      item.toolId !== null &&
      enabledTools !== null &&
      enabledTools[item.toolId] === false;

    const link = (
      <Link
        href={item.href}
        className={cn(
          'flex items-center rounded-lg text-sm font-medium transition-colors',
          showLabel ? 'gap-3 px-3 py-2' : 'justify-center p-2',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          isDisabled && 'opacity-50'
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {showLabel && (
          <span className="flex items-center gap-2 truncate">
            {item.name}
            {isDisabled && (
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
            )}
          </span>
        )}
      </Link>
    );

    if (!showLabel) {
      return (
        <Tooltip key={item.name}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.name}>{link}</div>;
  }

  const showLabel = !sidebarCollapsed;

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'flex h-full flex-col border-r bg-card transition-all duration-200',
          sidebarCollapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b px-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
              <Braces className="h-4 w-4 text-primary-foreground" />
            </div>
            {showLabel && (
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Agent Tools</span>
                <span className="text-[10px] text-muted-foreground">by atmatic.ai</span>
              </div>
            )}
          </Link>
          {showLabel && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={toggleSidebar}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        {sidebarCollapsed && (
          <div className="flex justify-center py-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleSidebar}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Pinned: Home & Settings */}
        <div className={cn('space-y-1', sidebarCollapsed ? 'p-2' : 'px-3 pt-3 pb-2')}>
          {pinnedNav.map((item) => renderNavItem(item, showLabel))}
        </div>

        {/* Search (expanded only) */}
        {showLabel && (
          <div className="px-3 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 w-full rounded-md border bg-background pl-8 pr-8 text-xs outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t" />

        {/* Scrollable tool list */}
        <nav
          className={cn(
            'flex-1 space-y-1 overflow-y-auto',
            sidebarCollapsed ? 'p-2' : 'p-3'
          )}
        >
          {showLabel && search && filteredTools.length === 0 && (
            <p className="px-3 py-4 text-xs text-muted-foreground text-center">
              No tools found
            </p>
          )}
          {(sidebarCollapsed ? tools : filteredTools).map((item) =>
            renderNavItem(item, showLabel)
          )}
        </nav>

        {/* Footer */}
        <div className="border-t p-3">
          {showLabel ? (
            <a
              href="https://atmatic.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Open source by <span className="font-medium">atmatic.ai</span>
            </a>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://atmatic.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center"
                >
                  <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                    a
                  </div>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                Open source by atmatic.ai
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
