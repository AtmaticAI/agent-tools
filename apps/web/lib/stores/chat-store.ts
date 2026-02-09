import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ToolResult {
  tool: string;
  success: boolean;
  result: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolResults?: ToolResult[];
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  enabledCategories: Record<string, boolean>;
  selectedModel: string;
  messagesRemaining: number | null; // null = unlimited
  sessionExpired: boolean;
  limitReached: boolean;

  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastAssistant: (content: string, toolResults?: ToolResult[]) => void;
  setLoading: (loading: boolean) => void;
  toggleCategory: (category: string) => void;
  setAllCategories: (enabled: boolean) => void;
  setModel: (model: string) => void;
  setMessagesRemaining: (count: number | null) => void;
  setSessionExpired: (expired: boolean) => void;
  setLimitReached: (reached: boolean) => void;
  reset: () => void;
}

const ALL_CATEGORIES: Record<string, boolean> = {
  json: true,
  csv: true,
  pdf: true,
  xml: true,
  excel: true,
  image: true,
  markdown: true,
  archive: true,
  regex: true,
  diff: true,
  sql: true,
  crypto: true,
  datetime: true,
  text: true,
  math: true,
  color: true,
  physics: true,
  structural: true,
};

const initialState = {
  messages: [] as ChatMessage[],
  isLoading: false,
  enabledCategories: { ...ALL_CATEGORIES },
  selectedModel: 'microsoft/Phi-4-mini-instruct',
  messagesRemaining: null as number | null,
  sessionExpired: false,
  limitReached: false,
};

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      ...initialState,

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              timestamp: Date.now(),
            },
          ],
        })),

      updateLastAssistant: (content, toolResults) =>
        set((state) => {
          const msgs = [...state.messages];
          for (let i = msgs.length - 1; i >= 0; i--) {
            if (msgs[i].role === 'assistant') {
              msgs[i] = { ...msgs[i], content, toolResults };
              break;
            }
          }
          return { messages: msgs };
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      toggleCategory: (category) =>
        set((state) => ({
          enabledCategories: {
            ...state.enabledCategories,
            [category]: !state.enabledCategories[category],
          },
        })),

      setAllCategories: (enabled) =>
        set(() => ({
          enabledCategories: Object.fromEntries(
            Object.keys(ALL_CATEGORIES).map((k) => [k, enabled])
          ),
        })),

      setModel: (model) => set({ selectedModel: model }),

      setMessagesRemaining: (count) => set({ messagesRemaining: count }),

      setSessionExpired: (expired) => set({ sessionExpired: expired }),

      setLimitReached: (reached) => set({ limitReached: reached }),

      reset: () => set({ ...initialState, enabledCategories: { ...ALL_CATEGORIES } }),
    }),
    {
      name: 'agent-tools-chat',
      partialize: (state) => ({
        enabledCategories: state.enabledCategories,
        selectedModel: state.selectedModel,
      }),
    }
  )
);
