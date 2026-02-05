export interface AgentCard {
  name: string;
  description: string;
  url: string;
  version: string;
  provider?: {
    organization: string;
    url: string;
  };
  capabilities: {
    streaming: boolean;
    pushNotifications: boolean;
    stateTransitionHistory?: boolean;
  };
  authentication?: {
    schemes: string[];
  };
  defaultInputModes: string[];
  defaultOutputModes: string[];
  skills: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  examples?: string[];
  inputModes?: string[];
  outputModes?: string[];
}

export type TaskState =
  | 'submitted'
  | 'working'
  | 'input-required'
  | 'completed'
  | 'failed'
  | 'canceled';

export interface Task {
  id: string;
  sessionId?: string;
  status: TaskStatus;
  artifacts?: Artifact[];
  history?: Message[];
}

export interface TaskStatus {
  state: TaskState;
  message?: Message;
  timestamp: string;
}

export interface Message {
  role: 'user' | 'agent';
  parts: Part[];
}

export type Part = TextPart | FilePart | DataPart;

export interface TextPart {
  type: 'text';
  text: string;
}

export interface FilePart {
  type: 'file';
  file: {
    name?: string;
    mimeType?: string;
    bytes?: string;
    uri?: string;
  };
}

export interface DataPart {
  type: 'data';
  data: Record<string, unknown>;
}

export interface Artifact {
  name?: string;
  description?: string;
  parts: Part[];
  index: number;
  append?: boolean;
  lastChunk?: boolean;
}

export interface TaskSendParams {
  id: string;
  sessionId?: string;
  message: Message;
  acceptedOutputModes?: string[];
  pushNotification?: PushNotificationConfig;
  historyLength?: number;
  metadata?: Record<string, unknown>;
}

export interface TaskCreateParams {
  skill: string;
  input: TaskInput;
  sessionId?: string;
}

export interface TaskInput {
  action: string;
  data?: unknown;
  options?: Record<string, unknown>;
}

export interface PushNotificationConfig {
  url: string;
  token?: string;
}

export interface TaskQueryParams {
  id: string;
  historyLength?: number;
}

export interface TaskCancelParams {
  id: string;
}
