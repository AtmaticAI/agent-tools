import { v4 as uuidv4 } from 'uuid';
import { settingsService } from '@agent-tools/core/settings';
import type { ToolCategory } from '@agent-tools/core/settings';
import { skills, handleSkill } from './skills';
import type {
  AgentCard,
  Task,
  TaskState,
  TaskCreateParams,
  TaskQueryParams,
  TaskCancelParams,
} from './types';

const tasks: Map<string, Task> = new Map();

const skillToCategory: Record<string, ToolCategory> = {
  'json-operations': 'json',
  'csv-operations': 'csv',
  'pdf-operations': 'pdf',
  'xml-operations': 'xml',
  'excel-operations': 'excel',
  'image-operations': 'image',
  'markdown-operations': 'markdown',
  'archive-operations': 'archive',
  'regex-operations': 'regex',
  'diff-operations': 'diff',
  'sql-operations': 'sql',
  'crypto-operations': 'crypto',
  'datetime-operations': 'datetime',
  'text-operations': 'text',
  'math-operations': 'math',
  'color-operations': 'color',
  'physics-operations': 'physics',
  'structural-operations': 'structural',
};

export async function getAgentCard(baseUrl: string): Promise<AgentCard> {
  const settings = await settingsService.getSettings();
  const enabledSkills = skills.filter((s) => {
    const category = skillToCategory[s.id];
    return !category || settings.enabled[category] !== false;
  });

  return {
    name: 'Agent Tools Data Agent',
    description:
      'Deterministic data transformation and document processing tools for the agentic era. Powered by atmatic.ai.',
    url: baseUrl,
    version: '1.0.0',
    provider: {
      organization: 'atmatic.ai',
      url: 'https://atmatic.ai',
    },
    capabilities: {
      streaming: true,
      pushNotifications: false,
      stateTransitionHistory: true,
    },
    authentication: {
      schemes: [],
    },
    defaultInputModes: ['application/json'],
    defaultOutputModes: ['application/json', 'application/octet-stream'],
    skills: enabledSkills,
  };
}

export async function createTask(params: TaskCreateParams): Promise<Task> {
  const { skill, input, sessionId } = params;

  const category = skillToCategory[skill];
  if (category) {
    const enabled = await settingsService.isToolEnabled(category);
    if (!enabled) {
      throw new Error(`The "${category}" tool category is currently disabled. Enable it in Settings.`);
    }
  }

  const skillDef = skills.find((s) => s.id === skill);
  if (!skillDef) {
    throw new Error(`Unknown skill: ${skill}`);
  }

  const taskId = uuidv4();
  const task: Task = {
    id: taskId,
    sessionId,
    status: {
      state: 'submitted',
      timestamp: new Date().toISOString(),
    },
    history: [
      {
        role: 'user',
        parts: [{ type: 'data', data: input as unknown as Record<string, unknown> }],
      },
    ],
  };

  tasks.set(taskId, task);

  setImmediate(async () => {
    try {
      updateTaskState(taskId, 'working');

      const resultParts = await handleSkill(skill, input);

      const updatedTask = tasks.get(taskId);
      if (updatedTask && updatedTask.status.state !== 'canceled') {
        updatedTask.status = {
          state: 'completed',
          message: {
            role: 'agent',
            parts: resultParts,
          },
          timestamp: new Date().toISOString(),
        };
        updatedTask.artifacts = [
          {
            name: 'result',
            parts: resultParts,
            index: 0,
            lastChunk: true,
          },
        ];
        updatedTask.history?.push({
          role: 'agent',
          parts: resultParts,
        });
      }
    } catch (error) {
      const updatedTask = tasks.get(taskId);
      if (updatedTask) {
        updatedTask.status = {
          state: 'failed',
          message: {
            role: 'agent',
            parts: [{ type: 'text', text: (error as Error).message }],
          },
          timestamp: new Date().toISOString(),
        };
      }
    }
  });

  return task;
}

export function getTask(params: TaskQueryParams): Task | null {
  const task = tasks.get(params.id);
  if (!task) return null;

  if (params.historyLength !== undefined && task.history) {
    return {
      ...task,
      history: params.historyLength === 0 ? [] : task.history.slice(-params.historyLength),
    };
  }

  return task;
}

export function cancelTask(params: TaskCancelParams): Task | null {
  const task = tasks.get(params.id);
  if (!task) return null;

  if (task.status.state === 'completed' || task.status.state === 'failed') {
    return task;
  }

  task.status = {
    state: 'canceled',
    timestamp: new Date().toISOString(),
  };

  return task;
}

function updateTaskState(taskId: string, state: TaskState): void {
  const task = tasks.get(taskId);
  if (task) {
    task.status = {
      state,
      timestamp: new Date().toISOString(),
    };
  }
}

export function listTasks(): Task[] {
  return Array.from(tasks.values());
}

export function clearCompletedTasks(): number {
  let cleared = 0;
  for (const [id, task] of tasks) {
    if (
      task.status.state === 'completed' ||
      task.status.state === 'failed' ||
      task.status.state === 'canceled'
    ) {
      tasks.delete(id);
      cleared++;
    }
  }
  return cleared;
}
