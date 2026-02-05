'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Upload, Download, Image as ImageIcon, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

export default function ImagePage() {
  const [preview, setPreview] = useState<string>('');
  const [outputPreview, setOutputPreview] = useState<string>('');
  const [metadata, setMetadata] = useState<Record<string, unknown> | null>(null);
  const [fileName, setFileName] = useState('');
  const [rawBase64, setRawBase64] = useState('');
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');
  const [convertFormat, setConvertFormat] = useState('webp');
  const [processing, setProcessing] = useState(false);
  const { containerRef } = useFullscreenContainer();
  const setSidebarCollapsed = useUIStore((s) => s.setSidebarCollapsed);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        const base64 = dataUrl.split(',')[1];
        setRawBase64(base64);
        setSidebarCollapsed(true);

        fetch('/api/image/metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64 }),
        })
          .then((r) => r.json())
          .then((data) => setMetadata(data.metadata || data))
          .catch(() => {});
      };
      reader.readAsDataURL(file);
    },
    [setSidebarCollapsed]
  );

  const handleResize = useCallback(async () => {
    if (!rawBase64) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/image/resize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: rawBase64,
          width: resizeWidth ? parseInt(resizeWidth) : undefined,
          height: resizeHeight ? parseInt(resizeHeight) : undefined,
        }),
      });
      const result = await res.json();
      if (result.data) {
        setOutputPreview(`data:image/png;base64,${result.data}`);
        toast.success('Image resized');
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
    setProcessing(false);
  }, [rawBase64, resizeWidth, resizeHeight]);

  const handleConvert = useCallback(async () => {
    if (!rawBase64) return;
    setProcessing(true);
    try {
      const res = await fetch('/api/image/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: rawBase64, format: convertFormat }),
      });
      const result = await res.json();
      if (result.data) {
        setOutputPreview(`data:image/${convertFormat};base64,${result.data}`);
        toast.success(`Converted to ${convertFormat.toUpperCase()}`);
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
    setProcessing(false);
  }, [rawBase64, convertFormat]);

  return (
    <main className="flex-1 overflow-auto p-6" ref={containerRef}>
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Image Toolkit</h1>
            <p className="text-muted-foreground">
              Resize, crop, convert, and inspect images
            </p>
            <ToolEnableToggle toolId="image" />
          </div>
          <AIIntegrationBadge tool="image" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>PNG, JPEG, WebP, GIF, TIFF, AVIF</CardDescription>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50">
              <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {fileName || 'Click to upload image'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {preview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Original
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={preview}
                  alt="Original"
                  className="max-h-[300px] rounded-md object-contain"
                />
                {metadata && (
                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                    {Object.entries(metadata).map(([k, v]) => (
                      <div key={k} className="rounded border p-2 text-center">
                        <div className="font-bold">{String(v)}</div>
                        <div className="text-muted-foreground">{k}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {outputPreview && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Output</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = outputPreview;
                      link.download = `output.${convertFormat}`;
                      link.click();
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <FullscreenButton targetRef={containerRef} />
                </div>
              </CardHeader>
              <CardContent>
                <img
                  src={outputPreview}
                  alt="Output"
                  className="max-h-[300px] rounded-md object-contain"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {preview && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Resize:</span>
                <Input
                  placeholder="Width"
                  className="w-24"
                  value={resizeWidth}
                  onChange={(e) => setResizeWidth(e.target.value)}
                />
                <span className="text-muted-foreground">x</span>
                <Input
                  placeholder="Height"
                  className="w-24"
                  value={resizeHeight}
                  onChange={(e) => setResizeHeight(e.target.value)}
                />
                <Button onClick={handleResize} disabled={processing}>
                  <RotateCw className="mr-1 h-4 w-4" />
                  Resize
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Convert:</span>
                <Select value={convertFormat} onValueChange={setConvertFormat}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpeg">JPEG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                    <SelectItem value="avif">AVIF</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleConvert} disabled={processing} variant="outline">
                  Convert
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
