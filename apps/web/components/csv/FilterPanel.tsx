'use client';

import type { Filter, FilterOperator } from '@agent-tools/core/csv';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Filter as FilterIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  columns: string[];
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
  className?: string;
}

const OPERATORS: { value: FilterOperator; label: string }[] = [
  { value: 'eq', label: 'equals' },
  { value: 'neq', label: 'not equals' },
  { value: 'gt', label: 'greater than' },
  { value: 'gte', label: 'greater or equal' },
  { value: 'lt', label: 'less than' },
  { value: 'lte', label: 'less or equal' },
  { value: 'contains', label: 'contains' },
  { value: 'startsWith', label: 'starts with' },
  { value: 'endsWith', label: 'ends with' },
  { value: 'matches', label: 'matches (regex)' },
  { value: 'isNull', label: 'is empty' },
  { value: 'isNotNull', label: 'is not empty' },
];

const NO_VALUE_OPERATORS: FilterOperator[] = ['isNull', 'isNotNull'];

export function FilterPanel({
  columns,
  filters,
  onFiltersChange,
  className,
}: FilterPanelProps) {
  const addFilter = () => {
    if (columns.length === 0) return;
    onFiltersChange([
      ...filters,
      { column: columns[0], operator: 'eq', value: '' },
    ]);
  };

  const updateFilter = (index: number, updates: Partial<Filter>) => {
    const newFilters = filters.map((f, i) =>
      i === index ? { ...f, ...updates } : f
    );
    onFiltersChange(newFilters);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  const clearFilters = () => {
    onFiltersChange([]);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <FilterIcon className="h-4 w-4" />
          Filters
          {filters.length > 0 && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {filters.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {filters.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={addFilter} disabled={columns.length === 0}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Filter
          </Button>
        </div>
      </div>

      {filters.length > 0 && (
        <div className="space-y-2">
          {filters.map((filter, index) => (
            <FilterRow
              key={index}
              filter={filter}
              columns={columns}
              onChange={(updates) => updateFilter(index, updates)}
              onRemove={() => removeFilter(index)}
            />
          ))}
        </div>
      )}

      {filters.length === 0 && (
        <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          No filters applied. Click "Add Filter" to filter your data.
        </div>
      )}
    </div>
  );
}

interface FilterRowProps {
  filter: Filter;
  columns: string[];
  onChange: (updates: Partial<Filter>) => void;
  onRemove: () => void;
}

function FilterRow({ filter, columns, onChange, onRemove }: FilterRowProps) {
  const showValueInput = !NO_VALUE_OPERATORS.includes(filter.operator);

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
      <Select value={filter.column} onValueChange={(v) => onChange({ column: v })}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Column" />
        </SelectTrigger>
        <SelectContent>
          {columns.map((col) => (
            <SelectItem key={col} value={col}>
              {col}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filter.operator}
        onValueChange={(v) => onChange({ operator: v as FilterOperator })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Operator" />
        </SelectTrigger>
        <SelectContent>
          {OPERATORS.map((op) => (
            <SelectItem key={op.value} value={op.value}>
              {op.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showValueInput && (
        <input
          type="text"
          value={String(filter.value ?? '')}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="Value"
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
        />
      )}

      <Button variant="ghost" size="icon" onClick={onRemove} className="h-9 w-9 shrink-0">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
