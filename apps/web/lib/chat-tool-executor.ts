import { allTools, type McpTool } from '@agent-tools/mcp-server';

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

export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  enabledCategories: Record<string, boolean>
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

  try {
    const response = await tool.handler(args as never);
    const text = response.content.map((c) => c.text).join('\n');
    return { tool: toolName, success: true, result: text };
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
  enabledCategories: Record<string, boolean>
): Promise<ToolCallResult[]> {
  return Promise.all(
    calls.map((call) => executeTool(call.tool, call.arguments, enabledCategories))
  );
}

export function getAvailableToolNames(): string[] {
  return allTools.map((t) => t.name);
}
