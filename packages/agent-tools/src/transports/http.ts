import express, { Request, Response } from 'express';
import { allTools } from '../tools';

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

export function createHttpServer(port: number = 3001) {
  const app = express();

  app.use(express.json({ limit: '50mb' }));

  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.options('*', (_req, res) => {
    res.sendStatus(200);
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'agent-tools-mcp', version: '1.0.0' });
  });

  app.post('/mcp', async (req: Request, res: Response) => {
    const request = req.body as JsonRpcRequest;

    if (request.jsonrpc !== '2.0') {
      return res.status(400).json({
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32600, message: 'Invalid Request' },
      });
    }

    try {
      const result = await handleRequest(request);
      res.json(result);
    } catch (error) {
      res.json({
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: (error as Error).message,
        },
      } as JsonRpcResponse);
    }
  });

  app.post('/mcp/stream', async (req: Request, res: Response) => {
    const request = req.body as JsonRpcRequest;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      res.write(`event: start\n`);
      res.write(`data: ${JSON.stringify({ id: request.id })}\n\n`);

      const result = await handleRequest(request);

      res.write(`event: result\n`);
      res.write(`data: ${JSON.stringify(result)}\n\n`);

      res.write(`event: end\n`);
      res.write(`data: {}\n\n`);

      res.end();
    } catch (error) {
      res.write(`event: error\n`);
      res.write(
        `data: ${JSON.stringify({ error: (error as Error).message })}\n\n`
      );
      res.end();
    }
  });

  app.get('/tools', (_req, res) => {
    res.json({
      tools: allTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    });
  });

  return app.listen(port, () => {
    console.log(`Agent Tools MCP HTTP server running on port ${port}`);
    console.log(`Endpoints:`);
    console.log(`  POST /mcp          - JSON-RPC endpoint`);
    console.log(`  POST /mcp/stream   - Streaming endpoint`);
    console.log(`  GET  /tools        - List available tools`);
    console.log(`  GET  /health       - Health check`);
  });
}

async function handleRequest(request: JsonRpcRequest): Promise<JsonRpcResponse> {
  const { method, params, id } = request;

  switch (method) {
    case 'tools/list':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: allTools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
          })),
        },
      };

    case 'tools/call': {
      const { name, arguments: args } = params as {
        name: string;
        arguments: Record<string, unknown>;
      };

      const tool = allTools.find((t) => t.name === name);
      if (!tool) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Unknown tool: ${name}` },
        };
      }

      try {
        const result = await tool.handler(args as never);
        return { jsonrpc: '2.0', id, result };
      } catch (error) {
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32603, message: (error as Error).message },
        };
      }
    }

    case 'initialize':
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          serverInfo: {
            name: 'agent-tools',
            version: '1.0.0',
          },
          capabilities: {
            tools: {},
          },
        },
      };

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }
}
