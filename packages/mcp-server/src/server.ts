import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { settingsService } from '@agent-tools/core/settings';
import type { ToolCategory } from '@agent-tools/core/settings';
import { allTools } from './tools';

function getToolCategory(toolName: string): ToolCategory | null {
  const match = toolName.match(/^agent_tools_([a-z]+)_/);
  return match ? (match[1] as ToolCategory) : null;
}

export function createServer() {
  const server = new Server(
    {
      name: 'agent-tools',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const settings = await settingsService.getSettings();
    const enabledTools = allTools.filter((tool) => {
      const category = getToolCategory(tool.name);
      return !category || settings.enabled[category] !== false;
    });

    return {
      tools: enabledTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    const category = getToolCategory(name);
    if (category) {
      const enabled = await settingsService.isToolEnabled(category);
      if (!enabled) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Error: The "${category}" tool category is currently disabled. Enable it in Settings.`,
            },
          ],
          isError: true,
        };
      }
    }

    const tool = allTools.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    try {
      const result = await tool.handler(args as never);
      return result;
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Error: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

export async function runStdioServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
