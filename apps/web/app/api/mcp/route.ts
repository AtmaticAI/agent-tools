import { NextRequest, NextResponse } from 'next/server';
import { allTools } from '@agent-tools/mcp-server';
import { settingsService } from '@agent-tools/core/settings';
import type { ToolCategory } from '@agent-tools/core/settings';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

function getToolCategory(toolName: string): ToolCategory | null {
  const match = toolName.match(/^agent_tools_([a-z]+)_/);
  return match ? (match[1] as ToolCategory) : null;
}

export async function GET() {
  const settings = await settingsService.getSettings();
  const enabledTools = allTools.filter((tool) => {
    const category = getToolCategory(tool.name);
    return !category || settings.enabled[category] !== false;
  });

  return NextResponse.json({
    tools: enabledTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as JsonRpcRequest;

  if (body.jsonrpc !== '2.0') {
    return NextResponse.json({
      jsonrpc: '2.0',
      id: body.id,
      error: { code: -32600, message: 'Invalid Request' },
    } as JsonRpcResponse);
  }

  const { method, params, id } = body;

  try {
    let result: unknown;

    switch (method) {
      case 'initialize':
        result = {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'agent-tools',
            version: '1.0.0',
          },
          capabilities: {
            tools: {},
          },
        };
        break;

      case 'tools/list': {
        const settings = await settingsService.getSettings();
        const enabledTools = allTools.filter((tool) => {
          const category = getToolCategory(tool.name);
          return !category || settings.enabled[category] !== false;
        });

        result = {
          tools: enabledTools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          })),
        };
        break;
      }

      case 'tools/call': {
        const { name, arguments: args } = params as {
          name: string;
          arguments: Record<string, unknown>;
        };

        const category = getToolCategory(name);
        if (category) {
          const enabled = await settingsService.isToolEnabled(category);
          if (!enabled) {
            return NextResponse.json({
              jsonrpc: '2.0',
              id,
              error: {
                code: -32603,
                message: `The "${category}" tool category is currently disabled. Enable it in Settings.`,
              },
            } as JsonRpcResponse);
          }
        }

        const tool = allTools.find((t) => t.name === name);
        if (!tool) {
          return NextResponse.json({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Unknown tool: ${name}` },
          } as JsonRpcResponse);
        }

        result = await tool.handler(args as never);
        break;
      }

      default:
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        } as JsonRpcResponse);
    }

    return NextResponse.json({ jsonrpc: '2.0', id, result } as JsonRpcResponse);
  } catch (error) {
    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: (error as Error).message },
    } as JsonRpcResponse);
  }
}
