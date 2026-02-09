'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; count: number }> = {
  json: { label: 'JSON Studio', icon: Braces, count: 10 },
  csv: { label: 'CSV Viewer', icon: Table2, count: 6 },
  pdf: { label: 'PDF Toolkit', icon: FileText, count: 5 },
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
  { id: 'microsoft/Phi-4-mini-instruct', label: 'Phi-4 Mini' },
  { id: 'Qwen/Qwen2.5-7B-Instruct', label: 'Qwen 2.5 7B' },
  { id: 'mistralai/Mistral-7B-Instruct-v0.3', label: 'Mistral 7B' },
  { id: 'meta-llama/Llama-3.1-8B-Instruct', label: 'Llama 3.1 8B' },
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
    addMessage,
    updateLastAssistant,
    setLoading,
    toggleCategory,
    setAllCategories,
    setModel,
    setMessagesRemaining,
    setLimitReached,
    reset,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    addMessage({ role: 'user', content: trimmed });
    addMessage({ role: 'assistant', content: '' });
    setLoading(true);
    setCreditsExhausted(false);

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

      updateLastAssistant(data.message, data.toolResults);

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
    addMessage,
    updateLastAssistant,
    setLoading,
    setLimitReached,
    setMessagesRemaining,
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
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.toolResults?.map((result, i) => (
                        <ToolResultCard key={i} result={result} />
                      ))}
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
            <div className="flex gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={limitReached ? 'Message limit reached' : 'Ask me to use any tool...'}
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
          <Select value={selectedModel} onValueChange={setModel}>
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
                    onCheckedChange={() => toggleCategory(key)}
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
