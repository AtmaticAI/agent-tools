import express, { Request, Response } from 'express';
import { allTools } from '../tools';

interface Client {
  id: string;
  res: Response;
}

const clients: Map<string, Client> = new Map();

export function createSSEServer(port: number = 3001) {
  const app = express();

  app.use(express.json({ limit: '50mb' }));

  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', server: 'agent-tools-mcp-sse', version: '1.0.0' });
  });

  app.get('/sse', (req: Request, res: Response) => {
    const clientId = Math.random().toString(36).substring(7);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write(`event: connected\n`);
    res.write(`data: ${JSON.stringify({ clientId })}\n\n`);

    res.write(`event: endpoint\n`);
    res.write(`data: ${JSON.stringify({ endpoint: `/message?clientId=${clientId}` })}\n\n`);

    clients.set(clientId, { id: clientId, res });

    req.on('close', () => {
      clients.delete(clientId);
    });
  });

  app.post('/message', async (req: Request, res: Response) => {
    const clientId = req.query.clientId as string;
    const client = clients.get(clientId);

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const { method, params, id } = req.body;

    try {
      let result: unknown;

      switch (method) {
        case 'tools/list':
          result = {
            tools: allTools.map((tool) => ({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema,
            })),
          };
          break;

        case 'tools/call': {
          const { name, arguments: args } = params;
          const tool = allTools.find((t) => t.name === name);

          if (!tool) {
            throw new Error(`Unknown tool: ${name}`);
          }

          result = await tool.handler(args);
          break;
        }

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

        default:
          throw new Error(`Unknown method: ${method}`);
      }

      client.res.write(`event: message\n`);
      client.res.write(
        `data: ${JSON.stringify({ jsonrpc: '2.0', id, result })}\n\n`
      );

      res.json({ status: 'sent' });
    } catch (error) {
      client.res.write(`event: message\n`);
      client.res.write(
        `data: ${JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: -32603, message: (error as Error).message },
        })}\n\n`
      );

      res.json({ status: 'error', error: (error as Error).message });
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
    console.log(`Agent Tools MCP SSE server running on port ${port}`);
    console.log(`Endpoints:`);
    console.log(`  GET  /sse          - SSE connection`);
    console.log(`  POST /message      - Send message (requires clientId)`);
    console.log(`  GET  /tools        - List available tools`);
    console.log(`  GET  /health       - Health check`);
  });
}
