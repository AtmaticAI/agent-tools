import { Command } from 'commander';
import { runStdioServer } from './server';
import { createHttpServer, createSSEServer } from './transports';

const program = new Command();

program
  .name('agent-tools-mcp')
  .description('Agent Tools MCP Server - Deterministic data transformation tools')
  .version('1.0.0');

program
  .option('-t, --transport <type>', 'Transport type: stdio, sse, http', 'stdio')
  .option('-p, --port <number>', 'Port for HTTP/SSE transport', '3001')
  .action(async (options) => {
    const { transport, port } = options;

    console.log(`Starting Agent Tools MCP server...`);
    console.log(`Transport: ${transport}`);

    switch (transport) {
      case 'stdio':
        await runStdioServer();
        break;

      case 'http':
        createHttpServer(parseInt(port, 10));
        break;

      case 'sse':
        createSSEServer(parseInt(port, 10));
        break;

      default:
        console.error(`Unknown transport: ${transport}`);
        process.exit(1);
    }
  });

program.parse();
