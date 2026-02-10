import { allTools, type McpTool } from '@atmaticai/agent-tools';

const toolMap = new Map<string, McpTool>();
for (const tool of allTools) {
  toolMap.set(tool.name, tool);
}

function getCategoryForTool(toolName: string): string {
  const stripped = toolName.replace(/^agent_tools_/, '');
  const parts = stripped.split('_');
  // Known multi-word categories: none currently, but handle gracefully
  return parts[0];
}

export interface ToolCallRequest {
  tool: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallResult {
  tool: string;
  success: boolean;
  result: string;
}

export function parseToolCalls(text: string): ToolCallRequest[] {
  const calls: ToolCallRequest[] = [];
  // Match ```tool ... ``` blocks
  const regex = /```tool\s*\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      if (parsed.tool && typeof parsed.tool === 'string') {
        calls.push({
          tool: parsed.tool,
          arguments: parsed.arguments || {},
        });
      }
    } catch {
      // Skip malformed JSON
    }
  }
  return calls;
}

export interface ChatFile {
  name: string;
  size: number;
  type: string;
  base64: string;
}

function resolveFilePlaceholders(
  args: Record<string, unknown>,
  files: ChatFile[]
): Record<string, unknown> {
  const resolved = { ...args };
  for (const key of Object.keys(resolved)) {
    const val = resolved[key];
    if (typeof val === 'string') {
      const match = val.match(/^__file:(\d+)__$/);
      if (match) {
        const idx = parseInt(match[1], 10);
        if (idx >= 0 && idx < files.length) {
          resolved[key] = files[idx].base64;
        }
      }
    }
  }
  return resolved;
}

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  enabledCategories: Record<string, boolean>,
  files?: ChatFile[]
): Promise<ToolCallResult> {
  const tool = toolMap.get(toolName);
  if (!tool) {
    return { tool: toolName, success: false, result: `Unknown tool: ${toolName}` };
  }

  const category = getCategoryForTool(toolName);
  if (enabledCategories[category] === false) {
    return {
      tool: toolName,
      success: false,
      result: `Tool category "${category}" is disabled. Enable it in the tool panel.`,
    };
  }

  const resolvedArgs = files ? resolveFilePlaceholders(args, files) : args;

  try {
    const response = await tool.handler(resolvedArgs as never);
    const text = response.content.map((c) => c.text).join('\n');
    const success = !response.isError;
    return { tool: toolName, success, result: text };
  } catch (e) {
    return {
      tool: toolName,
      success: false,
      result: `Error: ${(e as Error).message}`,
    };
  }
}

export async function executeToolCalls(
  calls: ToolCallRequest[],
  enabledCategories: Record<string, boolean>,
  files?: ChatFile[]
): Promise<ToolCallResult[]> {
  return Promise.all(
    calls.map((call) => executeTool(call.tool, call.arguments, enabledCategories, files))
  );
}

export function getAvailableToolNames(): string[] {
  return allTools.map((t) => t.name);
}
