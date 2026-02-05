'use client';

import { useState, useEffect, useCallback } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface ToolEnableToggleProps {
  toolId: string;
}

export function ToolEnableToggle({ toolId }: ToolEnableToggleProps) {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setEnabled(data.enabled?.[toolId] ?? true);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [toolId]);

  const toggle = useCallback(async () => {
    const newValue = !enabled;
    setEnabled(newValue);

    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      const updated = { ...data.enabled, [toolId]: newValue };

      const putRes = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: updated }),
      });
      if (!putRes.ok) throw new Error('Save failed');
      toast.success(`Tool ${newValue ? 'enabled' : 'disabled'}`);
    } catch {
      setEnabled(!newValue);
      toast.error('Failed to update setting');
    }
  }, [enabled, toolId]);

  if (loading) return null;

  return (
    <div className="mt-2 flex items-center gap-2">
      <Switch checked={enabled} onCheckedChange={toggle} />
      <span className="text-sm text-muted-foreground">
        {enabled ? 'Enabled' : 'Disabled'}
      </span>
    </div>
  );
}
