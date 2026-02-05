# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Tools is an agent-driven data transformation platform for MCP (Model Context Protocol) and A2A (Agent-to-Agent) systems. It provides deterministic tools for transforming, formatting, and inspecting structured data across 16 tool domains: JSON, CSV, PDF, XML, Excel, Image, Markdown, Archive, Regex, Diff, SQL, Crypto, DateTime, Text, Math, and Color.

**Philosophy**: "LLMs think. Agent Tools executes." - provides the authoritative execution layer for agents requiring strict correctness and repeatability.

## Commands

```bash
# Development
pnpm install              # Install dependencies
pnpm dev                  # Start all services (web + MCP server)
pnpm dev:web              # Start Next.js web app only (port 3000)
pnpm dev:mcp              # Start MCP server only

# Building
pnpm build                # Build all packages
pnpm build:web            # Build web app only
pnpm build:mcp            # Build MCP server only

# Testing
pnpm test                 # Run all tests (vitest)
pnpm --filter @agent-tools/core test           # Run core package tests only
pnpm --filter @agent-tools/mcp-server test     # Run MCP server tests only
cd packages/core && pnpm test:watch         # Watch mode for a specific package

# Code Quality
pnpm lint                 # ESLint across all packages
pnpm typecheck            # TypeScript type checking
pnpm format               # Prettier formatting
pnpm format:check         # Verify formatting
```

## Architecture

### Three-Layer Design

```
┌─────────────────────────────────────────────────────────────┐
│  UI Layer (apps/web)                                        │
│  Next.js 15 App Router, React 19, shadcn/ui, Zustand        │
├─────────────────────────────────────────────────────────────┤
│  Protocol Layer                                             │
│  ├── packages/mcp-server (MCP SDK, stdio/sse/http)          │
│  ├── packages/a2a-agent (Agent-to-Agent protocol)           │
│  └── apps/web/app/api/* (REST endpoints)                    │
├─────────────────────────────────────────────────────────────┤
│  Core Layer (packages/core)                                 │
│  Business logic: json/, csv/, pdf/, xml/, excel/, image/,   │
│  markdown/, archive/, regex/, diff/, sql/, crypto/,         │
│  datetime/, text/, math/, color/ modules                    │
└─────────────────────────────────────────────────────────────┘
```

### Package Dependencies

- `@agent-tools/core` - Standalone, no internal dependencies
- `@agent-tools/mcp-server` - Depends on `@agent-tools/core`
- `@agent-tools/a2a-agent` - Depends on `@agent-tools/core`
- `@agent-tools/web` - Depends on `@agent-tools/core` and `@agent-tools/a2a-agent`

### Core Modules

| Module | Path | Key Dependencies |
|--------|------|-----------------|
| JSON | `packages/core/src/json/` | json5, yaml, smol-toml, jsonpath-plus, jmespath |
| CSV | `packages/core/src/csv/` | papaparse |
| PDF | `packages/core/src/pdf/` | pdf-lib, pdf-parse |
| XML | `packages/core/src/xml/` | fast-xml-parser |
| Excel | `packages/core/src/excel/` | exceljs |
| Image | `packages/core/src/image/` | sharp |
| Markdown | `packages/core/src/markdown/` | marked, turndown |
| Archive | `packages/core/src/archive/` | archiver, adm-zip |
| Regex | `packages/core/src/regex/` | (built-in) |
| Diff | `packages/core/src/diff/` | diff |
| SQL | `packages/core/src/sql/` | sql-formatter, node-sql-parser |
| Crypto | `packages/core/src/crypto/` | (Node.js crypto) |
| DateTime | `packages/core/src/datetime/` | luxon |
| Text | `packages/core/src/text/` | (built-in) |
| Math | `packages/core/src/math/` | (built-in) |
| Color | `packages/core/src/color/` | (built-in) |

### Core Module Structure

Each module in `packages/core/src/` follows a consistent pattern:
- `types.ts` - TypeScript types and interfaces
- `parse.ts` / `format.ts` - Input processing
- `transform.ts` - Data manipulation
- `validate.ts` - Schema/data validation
- `stats.ts` - Statistics extraction
- `index.ts` - Public exports (barrel file)

### Adding New Functionality

1. Implement in `packages/core/src/{module}/`
2. Add subpath export in `packages/core/package.json` and entry point in `tsup.config.ts`
3. Expose as MCP tool in `packages/mcp-server/src/tools/`
4. Expose as A2A skill in `packages/a2a-agent/src/skills/`
5. Add REST route in `apps/web/app/api/{module}/`
6. Build UI page in `apps/web/app/(dashboard)/{module}/page.tsx`
7. Add sidebar navigation entry in `apps/web/components/layout/sidebar.tsx`

### Integration Patterns

**MCP Server** (for Claude Desktop, Claude Code):
```bash
npx @agent-tools/mcp-server --transport stdio  # Default
npx @agent-tools/mcp-server --transport sse    # Browser clients
npx @agent-tools/mcp-server --transport http   # Scalable deployments
```

**A2A Agent**:
- Agent card: `/.well-known/agent.json`
- Tasks: `POST /a2a/tasks`, `GET /a2a/tasks/:id`, `POST /a2a/tasks/:id/cancel`

**REST API**:
- Routes under `apps/web/app/api/{module}/{action}/route.ts`
- All use POST method with JSON body
- Binary data (Excel, Image, Archive) uses base64 encoding

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Web server port |
| `MCP_PORT` | `3001` | MCP server port |
| `MCP_TRANSPORT` | `stdio` | Transport: stdio, sse, http |

Tool categories are configured at runtime via the Settings page (`/settings`) or the `GET/PUT /api/settings` endpoint. Settings are persisted to `data/settings.json`.

## Conventions

- **Commits**: Conventional commits (`feat(scope): description`)
- **Branches**: `feature/`, `fix/`, `docs/`, `refactor/`, `test/`
- **Testing**: Vitest for unit tests, write tests for all new core functionality
- **TypeScript**: Strict mode enabled, full type coverage required
- **UI Components**: shadcn/ui primitives in `components/ui/`, feature components in `components/{module}/`
- **Import Paths**: Use `@/components/ui/` for UI components, `@/lib/stores/` for Zustand stores

## Key Files

- `turbo.json` - Build pipeline and task dependencies
- `packages/core/src/index.ts` - Core exports (all 16 modules)
- `packages/core/tsup.config.ts` - Build entry points per module
- `packages/mcp-server/src/server.ts` - MCP protocol handler
- `packages/mcp-server/src/tools/index.ts` - All MCP tool registrations
- `packages/a2a-agent/src/agent.ts` - A2A implementation
- `packages/a2a-agent/src/skills/index.ts` - All A2A skill registrations
- `apps/web/app/layout.tsx` - Root layout
- `apps/web/components/layout/sidebar.tsx` - Navigation sidebar
