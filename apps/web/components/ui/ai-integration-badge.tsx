import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIIntegrationBadgeProps {
  tool: 'json' | 'csv' | 'pdf' | 'xml' | 'sql' | 'text' | 'regex' | 'math' | 'markdown' | 'image' | 'excel' | 'diff' | 'datetime' | 'crypto' | 'color' | 'archive' | 'physics' | 'structural';
  className?: string;
}

export function AIIntegrationBadge({ tool, className }: AIIntegrationBadgeProps) {
  return (
    <Link
      href={`/connect#${tool}`}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 hover:border-primary/30',
        className
      )}
    >
      <Sparkles className="h-3.5 w-3.5" />
      <span>Use with Claude</span>
    </Link>
  );
}
