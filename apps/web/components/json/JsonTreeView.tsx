'use client';

import { useState, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronDown, ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface JsonTreeViewProps {
  data: unknown;
  className?: string;
}

export function JsonTreeView({ data, className }: JsonTreeViewProps) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['$']));

  const allPaths = useMemo(() => {
    const paths = new Set<string>();
    const collectPaths = (value: unknown, path: string) => {
      if (typeof value === 'object' && value !== null) {
        paths.add(path);
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            collectPaths(item, `${path}[${index}]`);
          });
        } else {
          Object.entries(value).forEach(([key, val]) => {
            collectPaths(val, `${path}.${key}`);
          });
        }
      }
    };
    collectPaths(data, '$');
    return paths;
  }, [data]);

  const togglePath = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedPaths(new Set(allPaths));
  }, [allPaths]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set(['$']));
  }, []);

  return (
    <div className={cn('font-mono text-sm', className)}>
      <div className="mb-3 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={expandAll}>
          <ChevronsDownUp className="mr-2 h-3 w-3" />
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>
          <ChevronsUpDown className="mr-2 h-3 w-3" />
          Collapse All
        </Button>
      </div>
      <JsonNode
        value={data}
        path="$"
        expandedPaths={expandedPaths}
        onToggle={togglePath}
        isRoot
      />
    </div>
  );
}

interface JsonNodeProps {
  value: unknown;
  path: string;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
  keyName?: string;
  isRoot?: boolean;
  isLast?: boolean;
}

function JsonNode({
  value,
  path,
  expandedPaths,
  onToggle,
  keyName,
  isRoot = false,
  isLast = true,
}: JsonNodeProps) {
  const isExpanded = expandedPaths.has(path);
  const isObject = typeof value === 'object' && value !== null;
  const isArray = Array.isArray(value);
  const itemCount = isObject ? (isArray ? value.length : Object.keys(value).length) : 0;

  const renderValue = () => {
    if (value === null) {
      return <span className="json-tree-null">null</span>;
    }
    if (typeof value === 'boolean') {
      return <span className="json-tree-boolean">{String(value)}</span>;
    }
    if (typeof value === 'number') {
      return <span className="json-tree-number">{value}</span>;
    }
    if (typeof value === 'string') {
      return <span className="json-tree-string">"{value}"</span>;
    }
    if (typeof value === 'undefined') {
      return <span className="json-tree-null">undefined</span>;
    }
    return null;
  };

  const renderCollapsedPreview = () => {
    if (isArray) {
      return (
        <span className="text-muted-foreground">
          [...] <span className="text-xs">({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
        </span>
      );
    }
    return (
      <span className="text-muted-foreground">
        {'{'} ... {'}'} <span className="text-xs">({itemCount} key{itemCount !== 1 ? 's' : ''})</span>
      </span>
    );
  };

  if (!isObject) {
    return (
      <div className="flex items-center py-0.5">
        <span className="w-4" />
        {keyName !== undefined && (
          <>
            <span className="json-tree-key">"{keyName}"</span>
            <span className="text-muted-foreground">: </span>
          </>
        )}
        {renderValue()}
        {!isLast && <span className="text-muted-foreground">,</span>}
      </div>
    );
  }

  const entries = isArray
    ? value.map((item, index) => [index, item] as const)
    : Object.entries(value);

  return (
    <div className={cn(!isRoot && 'ml-4')}>
      <div
        className="flex cursor-pointer items-center py-0.5 hover:bg-muted/50 rounded"
        onClick={() => onToggle(path)}
      >
        <span className="w-4 flex items-center justify-center text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </span>
        {keyName !== undefined && (
          <>
            <span className="json-tree-key">"{keyName}"</span>
            <span className="text-muted-foreground">: </span>
          </>
        )}
        {isExpanded ? (
          <span className="text-muted-foreground">{isArray ? '[' : '{'}</span>
        ) : (
          renderCollapsedPreview()
        )}
      </div>
      {isExpanded && (
        <>
          {entries.map(([key, val], index) => (
            <JsonNode
              key={String(key)}
              value={val}
              path={isArray ? `${path}[${key}]` : `${path}.${key}`}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
              keyName={isArray ? undefined : String(key)}
              isLast={index === entries.length - 1}
            />
          ))}
          <div className="flex items-center py-0.5">
            <span className="w-4" />
            <span className="text-muted-foreground">{isArray ? ']' : '}'}</span>
            {!isLast && <span className="text-muted-foreground">,</span>}
          </div>
        </>
      )}
    </div>
  );
}
