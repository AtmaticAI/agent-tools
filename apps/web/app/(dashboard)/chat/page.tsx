'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChatStore, type ToolResult } from '@/lib/stores/chat-store';
import { formatBytes, downloadFile } from '@/lib/utils';
import { analytics } from '@/lib/analytics';
import { toast } from 'sonner';
import {
  Send,
  Loader2,
  Bot,
  User,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Braces,
  Table2,
  FileText,
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
  Type,
  Calculator,
  Palette,
  Atom,
  Building2,
  Sparkles,
  Paperclip,
  X,
  Download,
} from 'lucide-react';

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; count: number }> = {
  json: { label: 'JSON Studio', icon: Braces, count: 10 },
  csv: { label: 'CSV Viewer', icon: Table2, count: 6 },
  pdf: { label: 'PDF Toolkit', icon: FileText, count: 7 },
  xml: { label: 'XML Studio', icon: Code2, count: 5 },
  excel: { label: 'Excel Viewer', icon: FileSpreadsheet, count: 4 },
  image: { label: 'Image Toolkit', icon: Image, count: 5 },
  markdown: { label: 'Markdown Studio', icon: FileType, count: 4 },
  archive: { label: 'Archive Manager', icon: Archive, count: 3 },
  regex: { label: 'Regex Tester', icon: Regex, count: 3 },
  diff: { label: 'Diff & Patch', icon: GitCompare, count: 3 },
  sql: { label: 'SQL Studio', icon: Database, count: 4 },
  crypto: { label: 'Crypto & Encoding', icon: Lock, count: 8 },
  datetime: { label: 'Date/Time Tools', icon: Clock, count: 6 },
  text: { label: 'Text Utilities', icon: Type, count: 8 },
  math: { label: 'Math Utilities', icon: Calculator, count: 5 },
  color: { label: 'Color Utilities', icon: Palette, count: 5 },
  physics: { label: 'Physics Calculator', icon: Atom, count: 8 },
  structural: { label: 'Structural Eng.', icon: Building2, count: 6 },
};

const MODELS = [
  { id: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen 2.5 7B' },
  { id: 'meta-llama/Llama-3.1-8B-Instruct', label: 'Llama 3.1 8B' },
  { id: 'mistralai/Mistral-7B-Instruct-v0.3', label: 'Mistral 7B' },
  { id: 'google/gemma-2-2b-it', label: 'Gemma 2 2B' },
];

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/zip',
  'application/x-zip-compressed',
];

function ToolResultCard({ result }: { result: ToolResult }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="mt-2 rounded-lg border bg-muted/50 text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-muted/80 transition-colors rounded-lg"
      >
        {expanded ? (
          <ChevronDown className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        )}
        <span className="font-mono text-xs">{result.tool}</span>
        <span
          className={`ml-auto text-xs ${result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {result.success ? 'Success' : 'Error'}
        </span>
      </button>
      {expanded && (
        <div className="border-t px-3 py-2">
          <pre className="whitespace-pre-wrap text-xs text-muted-foreground max-h-60 overflow-auto">
            {result.result}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const {
    messages,
    isLoading,
    enabledCategories,
    selectedModel,
    messagesRemaining,
    limitReached,
    pendingAttachments,
    addMessage,
    updateLastAssistant,
    setLoading,
    toggleCategory,
    setAllCategories,
    setModel,
    setMessagesRemaining,
    setLimitReached,
    addAttachment,
    removeAttachment,
    clearAttachments,
    reset,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset to first model if persisted value is stale
  useEffect(() => {
    if (!MODELS.some((m) => m.id === selectedModel)) {
      setModel(MODELS[0].id);
    }
  }, [selectedModel, setModel]);

  // Check API configuration on mount
  useEffect(() => {
    fetch('/api/chat')
      .then((res) => res.json())
      .then((data) => {
        setConfigured(data.configured);
        if (data.messagesRemaining !== null && data.messagesRemaining !== undefined) {
          setMessagesRemaining(data.messagesRemaining);
        }
      })
      .catch(() => setConfigured(false));
  }, [setMessagesRemaining]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const processFile = useCallback((file: File) => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error(`Unsupported file type: ${file.type || 'unknown'}`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} exceeds 10MB limit (${formatBytes(file.size)})`);
      return;
    }
    if (pendingAttachments.length >= MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files per message`);
      return;
    }
    if (pendingAttachments.some((a) => a.name === file.name)) {
      toast.error(`${file.name} is already attached`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      addAttachment({ name: file.name, size: file.size, type: file.type, base64 });
      toast.success(`Attached ${file.name}`);
    };
    reader.onerror = () => toast.error(`Failed to read ${file.name}`);
    reader.readAsArrayBuffer(file);
  }, [pendingAttachments, addAttachment]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(processFile);
    }
    e.target.value = '';
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files) {
      Array.from(files).forEach(processFile);
    }
  }, [processFile]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const filesToSend = [...pendingAttachments];
    const attachmentMeta = filesToSend.length > 0
      ? filesToSend.map(({ name, size, type }) => ({ name, size, type }))
      : undefined;

    setInput('');
    addMessage({ role: 'user', content: trimmed, attachments: attachmentMeta });
    clearAttachments();
    addMessage({ role: 'assistant', content: '' });
    setLoading(true);
    setCreditsExhausted(false);
    analytics.chatMessageSent(selectedModel);

    try {
      const history = messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          enabledCategories,
          model: selectedModel,
          history,
          ...(filesToSend.length > 0 && {
            files: filesToSend.map(({ name, size, type, base64 }) => ({ name, size, type, base64 })),
          }),
        }),
      });

      const data = await res.json();

      if (data.limited) {
        setLimitReached(true);
        updateLastAssistant(data.message);
        return;
      }

      if (data.code === 'CREDITS_EXHAUSTED') {
        setCreditsExhausted(true);
        updateLastAssistant(
          "We're running low on AI credits. The service is temporarily unavailable."
        );
        return;
      }

      if (data.code === 'AI_NOT_CONFIGURED') {
        updateLastAssistant(
          'AI service is not configured. Please set the HF_TOKEN environment variable to enable chat.'
        );
        return;
      }

      if (data.error) {
        updateLastAssistant(`Error: ${data.error}`);
        return;
      }

      updateLastAssistant(data.message, data.toolResults, data.fileOutputs);

      if (data.messagesRemaining !== null && data.messagesRemaining !== undefined) {
        setMessagesRemaining(data.messagesRemaining);
      }
    } catch {
      updateLastAssistant('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [
    input,
    isLoading,
    messages,
    enabledCategories,
    selectedModel,
    pendingAttachments,
    addMessage,
    updateLastAssistant,
    setLoading,
    setLimitReached,
    setMessagesRemaining,
    clearAttachments,
  ]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const enabledCount = Object.values(enabledCategories).filter(Boolean).length;
  const totalCategories = Object.keys(CATEGORY_META).length;

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14)-theme(spacing.6)*2)] gap-0 -m-6">
      {/* Left: Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-6 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Agent Tools AI</h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md">
                  Chat with AI to use any of the {enabledCount * 7}+ tools. Ask me to convert data,
                  format JSON, calculate values, and more.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {['Format this JSON', 'Convert 100°F to Celsius', 'Generate a UUID', 'Parse a CSV'].map(
                    (suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="rounded-full border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border'
                  }`}
                >
                  {msg.role === 'assistant' && !msg.content && isLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs">Thinking...</span>
                    </div>
                  ) : (
                    <>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:my-2 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-code:before:content-none prose-code:after:content-none prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-muted prose-pre:text-foreground prose-pre:border prose-pre:border-border">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <div>
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {msg.attachments.map((att) => (
                                <span
                                  key={att.name}
                                  className="inline-flex items-center gap-1 rounded-md bg-primary-foreground/20 px-2 py-0.5 text-xs"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  {att.name} ({formatBytes(att.size)})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      {msg.toolResults?.map((result, i) => (
                        <ToolResultCard key={i} result={result} />
                      ))}
                      {msg.fileOutputs && msg.fileOutputs.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {msg.fileOutputs.map((file, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                const bytes = Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0));
                                downloadFile(bytes, file.name, file.mime);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg border bg-primary/5 px-3 py-1.5 text-xs font-medium hover:bg-primary/10 transition-colors"
                            >
                              <Download className="h-3.5 w-3.5" />
                              {file.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Limit reached banner */}
        {limitReached && (
          <div className="mx-6 mb-2 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Free message limit reached.{' '}
              <a
                href="https://atmatic.ai/tools"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline inline-flex items-center gap-1"
              >
                Get unlimited access <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        )}

        {/* Credits exhausted banner */}
        {creditsExhausted && (
          <div className="mx-6 mb-2 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
            <AlertCircle className="h-4 w-4 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              We&apos;re running low on AI credits.{' '}
              <a
                href="https://atmatic.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline inline-flex items-center gap-1"
              >
                Contact us for dedicated access <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        )}

        {/* Not configured banner */}
        {configured === false && (
          <div className="mx-6 mb-2 flex items-center gap-3 rounded-lg border border-muted bg-muted/50 p-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-sm text-muted-foreground">
              AI chat is not configured. Set the <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">HF_TOKEN</code> environment variable to enable.
            </p>
          </div>
        )}

        {/* Input area */}
        <div className="border-t bg-background px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.xlsx,.xls,.zip"
              multiple
              onChange={handleFileSelect}
            />

            {/* Pending attachment chips */}
            {pendingAttachments.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {pendingAttachments.map((att) => (
                  <span
                    key={att.name}
                    className="inline-flex items-center gap-1 rounded-lg border bg-muted/50 px-2.5 py-1 text-xs"
                  >
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="max-w-[150px] truncate">{att.name}</span>
                    <span className="text-muted-foreground">({formatBytes(att.size)})</span>
                    <button
                      onClick={() => removeAttachment(att.name)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-muted transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div
              className={`flex gap-2 ${isDragging ? 'ring-2 ring-primary/40 rounded-xl' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-[44px] w-[44px] rounded-xl shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || limitReached}
                title="Attach files (PDF, images, Excel, ZIP)"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={limitReached ? 'Message limit reached' : isDragging ? 'Drop files here...' : 'Ask me to use any tool...'}
                disabled={isLoading || limitReached}
                rows={1}
                className="flex-1 resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 disabled:opacity-50 min-h-[44px] max-h-[120px]"
                style={{ overflow: 'auto' }}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading || limitReached}
                size="icon"
                className="h-[44px] w-[44px] rounded-xl shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {messagesRemaining !== null
                  ? `${messagesRemaining} free messages remaining`
                  : 'Unlimited messages'}
              </span>
              <button
                onClick={reset}
                className="hover:text-foreground transition-colors"
              >
                New conversation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Tool Panel */}
      <div className="w-72 border-l bg-card flex flex-col overflow-hidden">
        {/* Model picker */}
        <div className="border-b p-4 space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Model
          </h3>
          <Select value={selectedModel} onValueChange={(v) => { setModel(v); analytics.chatModelChanged(v); }}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((m) => (
                <SelectItem key={m.id} value={m.id} className="text-xs">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tool toggles */}
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Tools ({enabledCount}/{totalCategories})
          </h3>
          <div className="flex gap-1">
            <button
              onClick={() => setAllCategories(true)}
              className="text-xs text-primary hover:underline"
            >
              All
            </button>
            <span className="text-muted-foreground">/</span>
            <button
              onClick={() => setAllCategories(false)}
              className="text-xs text-primary hover:underline"
            >
              None
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const enabled = enabledCategories[key] !== false;
              return (
                <label
                  key={key}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <Switch
                    checked={enabled}
                    onCheckedChange={() => { toggleCategory(key); analytics.toolToggled(key, !enabled); }}
                    className="scale-75"
                  />
                  <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs flex-1 truncate">{meta.label}</span>
                  <span className="text-[10px] text-muted-foreground">{meta.count}</span>
                </label>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
