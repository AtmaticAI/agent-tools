'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Upload,
  FileText,
  Merge,
  Split,
  Trash2,
  Download,
  GripVertical,
  FileCode,
  FilePlus,
} from 'lucide-react';
import { cn, downloadFile } from '@/lib/utils';
import { FullscreenButton, useFullscreenContainer } from '@/components/ui/fullscreen-button';
import { AIIntegrationBadge } from '@/components/ui/ai-integration-badge';
import { ToolEnableToggle } from '@/components/ui/tool-enable-toggle';
import { useUIStore } from '@/lib/stores/ui-store';

interface PDFFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  pageCount?: number;
}

export default function PdfPage() {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [processing, setProcessing] = useState(false);

  const { containerRef, isFullscreen } = useFullscreenContainer();
  const { setSidebarCollapsed } = useUIStore();

  // Auto-collapse sidebar when files are uploaded
  useEffect(() => {
    if (files.length > 0) {
      setSidebarCollapsed(true);
    }
  }, [files.length, setSidebarCollapsed]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        const data = await file.arrayBuffer();
        return {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          data,
        };
      })
    );
    setFiles((prev) => [...prev, ...newFiles]);
    toast.success(`Added ${newFiles.length} file(s)`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Need at least 2 files to merge');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch('/api/pdf/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map((f) => Buffer.from(f.data).toString('base64')),
        }),
      });

      if (!response.ok) throw new Error('Merge failed');

      const result = await response.json();
      const pdfData = Buffer.from(result.data, 'base64');
      downloadFile(new Uint8Array(pdfData), 'merged.pdf', 'application/pdf');
      toast.success('PDFs merged successfully');
    } catch {
      toast.error('Merge failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleSplit = async (fileIndex: number, ranges: string) => {
    setProcessing(true);
    try {
      const file = files[fileIndex];
      const response = await fetch('/api/pdf/split', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: Buffer.from(file.data).toString('base64'),
          ranges,
        }),
      });

      if (!response.ok) throw new Error('Split failed');

      const result = await response.json();
      result.files.forEach((base64: string, i: number) => {
        const pdfData = Buffer.from(base64, 'base64');
        downloadFile(new Uint8Array(pdfData), `split-${i + 1}.pdf`, 'application/pdf');
      });
      toast.success('PDF split successfully');
    } catch {
      toast.error('Split failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleExtractText = async (fileIndex: number) => {
    setProcessing(true);
    try {
      const file = files[fileIndex];
      const response = await fetch('/api/pdf/extract-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: Buffer.from(file.data).toString('base64'),
        }),
      });

      if (!response.ok) throw new Error('Extraction failed');

      const result = await response.json();
      downloadFile(result.text, `${file.name.replace('.pdf', '')}.txt`, 'text/plain');
      toast.success('Text extracted');
    } catch {
      toast.error('Extraction failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleExtractTemplate = async (fileIndex: number, name: string) => {
    setProcessing(true);
    try {
      const file = files[fileIndex];
      const response = await fetch('/api/pdf/to-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: Buffer.from(file.data).toString('base64'),
          name: name || file.name.replace('.pdf', ''),
        }),
      });

      if (!response.ok) throw new Error('Template extraction failed');

      const result = await response.json();
      const json = JSON.stringify(result.template, null, 2);
      downloadFile(json, `${file.name.replace('.pdf', '')}-template.json`, 'application/json');
      toast.success('Template extracted');
    } catch {
      toast.error('Template extraction failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateFromTemplate = async (templateJson: string, dataJson: string) => {
    setProcessing(true);
    try {
      let template;
      try {
        template = JSON.parse(templateJson);
      } catch {
        toast.error('Invalid template JSON');
        return;
      }

      let data = {};
      if (dataJson.trim()) {
        try {
          data = JSON.parse(dataJson);
        } catch {
          toast.error('Invalid data JSON');
          return;
        }
      }

      const response = await fetch('/api/pdf/from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, data }),
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const result = await response.json();
      const pdfData = Buffer.from(result.data, 'base64');
      downloadFile(new Uint8Array(pdfData), 'generated.pdf', 'application/pdf');
      toast.success('PDF generated from template');
    } catch {
      toast.error('PDF generation failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">PDF Toolkit</h1>
          <p className="text-muted-foreground">
            Merge, split, extract, and transform PDF documents
          </p>
          <ToolEnableToggle toolId="pdf" />
        </div>
        <AIIntegrationBadge tool="pdf" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Upload PDFs</CardTitle>
              <CardDescription>Drop files or click to upload</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={cn(
                  'flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 hover:border-primary/50'
                )}
              >
                <input {...getInputProps()} />
                <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {isDragActive ? 'Drop files here' : 'Drop PDFs or click to upload'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Files ({files.length})</CardTitle>
                {files.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFiles([])}
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {files.length > 0 ? (
                <ScrollArea className="h-[300px]">
                  <DraggableFileList files={files} onRemove={removeFile} onReorder={moveFile} />
                </ScrollArea>
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No files uploaded
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div
          ref={containerRef}
          className={cn(
            'lg:col-span-2',
            isFullscreen && 'bg-background p-6 h-screen'
          )}
        >
          <Card className={cn(isFullscreen && 'h-full flex flex-col')}>
            <Tabs defaultValue="merge" className="h-full flex flex-col">
              <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="merge" className="gap-2">
                      <Merge className="h-4 w-4" />
                      Merge
                    </TabsTrigger>
                    <TabsTrigger value="split" className="gap-2">
                      <Split className="h-4 w-4" />
                      Split
                    </TabsTrigger>
                    <TabsTrigger value="extract" className="gap-2">
                      <FileText className="h-4 w-4" />
                      Extract
                    </TabsTrigger>
                    <TabsTrigger value="to-template" className="gap-2">
                      <FileCode className="h-4 w-4" />
                      To Template
                    </TabsTrigger>
                    <TabsTrigger value="from-template" className="gap-2">
                      <FilePlus className="h-4 w-4" />
                      From Template
                    </TabsTrigger>
                  </TabsList>
                  <FullscreenButton targetRef={containerRef} variant="ghost" />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="merge" className="m-0">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Merge multiple PDFs into a single document. Files will be merged
                      in the order shown.
                    </p>

                    {files.length > 0 && (
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <h4 className="mb-2 text-sm font-medium">Merge Order</h4>
                        <p className="text-xs text-muted-foreground mb-3">Drag and drop to reorder files</p>
                        <DraggableFileList files={files} onRemove={removeFile} onReorder={moveFile} showIndex />
                      </div>
                    )}

                    <Button
                      onClick={handleMerge}
                      disabled={files.length < 2 || processing}
                      className="w-full"
                    >
                      {processing ? 'Processing...' : 'Merge PDFs'}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="split" className="m-0">
                  <SplitPanel
                    files={files}
                    onSplit={handleSplit}
                    processing={processing}
                  />
                </TabsContent>

              <TabsContent value="extract" className="m-0">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Extract text content from a PDF document.
                    </p>

                    {files.length > 0 ? (
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-4 w-4 text-primary" />
                              <span className="text-sm">{file.name}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExtractText(index)}
                              disabled={processing}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Extract Text
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
                        Upload a PDF to extract text
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="to-template" className="m-0">
                  <ToTemplatePanel
                    files={files}
                    onExtract={handleExtractTemplate}
                    processing={processing}
                  />
                </TabsContent>

                <TabsContent value="from-template" className="m-0">
                  <FromTemplatePanel
                    onGenerate={handleGenerateFromTemplate}
                    processing={processing}
                  />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DraggableFileList({
  files,
  onRemove,
  onReorder,
  showIndex = false,
}: {
  files: PDFFile[];
  onRemove: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  showIndex?: boolean;
}) {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDragIndex(index);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    setOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      onReorder(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="space-y-1.5">
      {files.map((file, index) => (
        <div
          key={file.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnter={() => handleDragEnter(index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            'flex items-center gap-3 rounded-lg border bg-card p-3 transition-all cursor-grab active:cursor-grabbing',
            dragIndex === index && 'opacity-40 scale-[0.98]',
            overIndex === index && dragIndex !== index && 'border-primary border-dashed bg-primary/5',
          )}
        >
          {showIndex && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium">
              {index + 1}
            </span>
          )}
          <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
          <FileText className="h-4 w-4 shrink-0 text-primary" />
          <span className="flex-1 truncate text-sm">{file.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onRemove(file.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function SplitPanel({
  files,
  onSplit,
  processing,
}: {
  files: PDFFile[];
  onSplit: (index: number, ranges: string) => void;
  processing: boolean;
}) {
  const [selectedFile, setSelectedFile] = useState(0);
  const [ranges, setRanges] = useState('1-3,4-6');

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Split a PDF into multiple documents by specifying page ranges.
      </p>

      {files.length > 0 ? (
        <>
          <div className="space-y-3">
            <label className="text-sm font-medium">Select File</label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(parseInt(e.target.value))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {files.map((file, i) => (
                <option key={file.id} value={i}>
                  {file.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Page Ranges</label>
            <input
              type="text"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              placeholder="1-3,4-6,7-10"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated ranges (e.g., 1-3,4-6,7-10). Each range creates a
              separate PDF.
            </p>
          </div>

          <Button
            onClick={() => onSplit(selectedFile, ranges)}
            disabled={processing || !ranges}
            className="w-full"
          >
            {processing ? 'Processing...' : 'Split PDF'}
          </Button>
        </>
      ) : (
        <div className="rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
          Upload a PDF to split
        </div>
      )}
    </div>
  );
}

function ToTemplatePanel({
  files,
  onExtract,
  processing,
}: {
  files: PDFFile[];
  onExtract: (index: number, name: string) => void;
  processing: boolean;
}) {
  const [selectedFile, setSelectedFile] = useState(0);
  const [templateName, setTemplateName] = useState('');

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Extract a reusable JSON template from a PDF. Detects {'{{placeholder}}'} fields
        for dynamic content replacement.
      </p>

      {files.length > 0 ? (
        <>
          <div className="space-y-3">
            <label className="text-sm font-medium">Select File</label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(parseInt(e.target.value))}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              {files.map((file, i) => (
                <option key={file.id} value={i}>
                  {file.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Template Name (optional)</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Invoice Template"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>

          <Button
            onClick={() => onExtract(selectedFile, templateName)}
            disabled={processing}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            {processing ? 'Processing...' : 'Extract Template'}
          </Button>
        </>
      ) : (
        <div className="rounded-lg border bg-muted/50 p-8 text-center text-muted-foreground">
          Upload a PDF to extract a template
        </div>
      )}
    </div>
  );
}

function FromTemplatePanel({
  onGenerate,
  processing,
}: {
  onGenerate: (template: string, data: string) => void;
  processing: boolean;
}) {
  const [templateJson, setTemplateJson] = useState('');
  const [dataJson, setDataJson] = useState('');

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Generate a PDF from a template JSON and data JSON. Placeholders in the template
        will be replaced with the provided data values.
      </p>

      <div className="space-y-3">
        <label className="text-sm font-medium">Template JSON</label>
        <textarea
          value={templateJson}
          onChange={(e) => setTemplateJson(e.target.value)}
          placeholder='Paste template JSON here...'
          className="h-40 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Data JSON</label>
        <textarea
          value={dataJson}
          onChange={(e) => setDataJson(e.target.value)}
          placeholder='{"name": "John Doe", "email": "john@example.com"}'
          className="h-24 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm"
        />
      </div>

      <Button
        onClick={() => onGenerate(templateJson, dataJson)}
        disabled={processing || !templateJson.trim()}
        className="w-full"
      >
        <FilePlus className="mr-2 h-4 w-4" />
        {processing ? 'Processing...' : 'Generate PDF'}
      </Button>
    </div>
  );
}
