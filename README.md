# Agent Tools

**Deterministic data transformation and formatting for AI agents.**

An open source project by [atmatic.ai](https://atmatic.ai/tools)

[![CI](https://github.com/AtmaticAI/agent-tools/actions/workflows/ci.yml/badge.svg)](https://github.com/AtmaticAI/agent-tools/actions/workflows/ci.yml)
[![CodeQL](https://github.com/AtmaticAI/agent-tools/actions/workflows/codeql.yml/badge.svg)](https://github.com/AtmaticAI/agent-tools/actions/workflows/codeql.yml)
[![Apache 2.0 License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![npm](https://img.shields.io/npm/v/@agent-tools/mcp-server.svg)](https://www.npmjs.com/package/@agent-tools/mcp-server)
[![GitHub release](https://img.shields.io/github/v/release/AtmaticAI/agent-tools)](https://github.com/AtmaticAI/agent-tools/releases)
[![GitHub issues](https://img.shields.io/github/issues/AtmaticAI/agent-tools)](https://github.com/AtmaticAI/agent-tools/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/AtmaticAI/agent-tools)](https://github.com/AtmaticAI/agent-tools/pulls)
[![GitHub stars](https://img.shields.io/github/stars/AtmaticAI/agent-tools?style=social)](https://github.com/AtmaticAI/agent-tools)
[![GitHub contributors](https://img.shields.io/github/contributors/AtmaticAI/agent-tools)](https://github.com/AtmaticAI/agent-tools/graphs/contributors)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9-orange.svg)](https://pnpm.io/)

---

Agent Tools is an agent-driven data utility platform that provides deterministic tools for transforming, formatting, and inspecting structured data. Designed for MCP and A2A systems, Agent Tools ensures that when agents act, the resulting data is correct, inspectable, and production-ready.

---

## Why Agent Tools?

**LLMs think. Agent Tools executes.**

While LLMs excel at reasoning and understanding intent, they struggle with:

- **Large files** (MB–GB): Token limits cause truncation
- **Strict correctness**: One missing comma = broken output
- **Binary formats**: PDF operations require precise byte manipulation
- **Repeatability**: Enterprise needs deterministic, auditable results
- **Security**: Air-gapped environments, no data leakage

Agent Tools provides the authoritative execution layer that agents can trust.

---

## Live Demo

Try Agent Tools instantly without any installation:

**[https://tools.atmatic.ai](https://tools.atmatic.ai)**

This is a hosted version of the open source code — the same tools, same features, running on managed infrastructure.

---

## Screenshots

Browse screenshots of all 16 tools in the [screenshots](./screenshots/) directory:

- [Homepage](screenshots/homepage.png)
- [JSON Studio](screenshots/json-studio.png)
- [CSV Viewer](screenshots/csv-viewer.png)
- [PDF Toolkit](screenshots/pdf-toolkit.png)
- [PDF - Extract Template](screenshots/pdf-to-template.png)
- [PDF - Generate from Template](screenshots/pdf-from-template.png)
- [XML Studio](screenshots/xml-studio.png)
- [Excel Viewer](screenshots/excel-viewer.png)
- [Image Toolkit](screenshots/image-toolkit.png)
- [Markdown Studio](screenshots/markdown-studio.png)
- [Archive Manager](screenshots/archive-manager.png)
- [Regex Tester](screenshots/regex-tester.png)
- [Diff & Patch](screenshots/diff-patch.png)
- [SQL Studio](screenshots/sql-studio.png)
- [Crypto & Encoding](screenshots/crypto-encoding.png)
- [Date/Time Tools](screenshots/datetime-tools.png)
- [Text Utilities](screenshots/text-utilities.png)
- [Math Utilities](screenshots/math-utilities.png)
- [Color Utilities](screenshots/color-utilities.png)
- [Connect (Integration Guide)](screenshots/connect.png)
- [Settings](screenshots/settings.png)

---

## Features

### JSON Studio
- Tree view with expand/collapse navigation
- Format with configurable indentation (2/4/tabs)
- JSON Schema validation
- JSONPath/JMESPath queries
- Convert between JSON, JSON5, JSONC, YAML, TOML
- Side-by-side diff comparison
- Deep search with regex

### CSV Viewer
- Virtual scrolling for 100k+ rows
- Column sort, filter, hide, reorder
- Auto-detect data types
- Export to CSV, JSON, Excel
- Column statistics and distributions

### PDF Toolkit
- Merge multiple PDFs with page selection
- Split by page ranges
- Drag-and-drop page reordering
- Thumbnail previews
- Rotate, compress, extract text
- View/edit metadata
- Extract reusable templates from PDFs (detects `{{placeholder}}` fields)
- Generate PDFs from templates with data replacement

### XML Studio
- Parse XML to JSON with configurable options
- Format/pretty-print and minify XML
- Validate XML structure
- Query XML with path expressions
- Convert between XML and JSON
- XML document statistics (elements, attributes, depth)

### Excel Viewer
- Upload and parse `.xlsx` files
- View sheet data in tabular format
- Export to CSV, TSV, JSON
- Workbook statistics and sheet listing
- Create Excel files from JSON data

### Image Toolkit
- Resize images with fit options (cover, contain, fill)
- Convert between PNG, JPEG, WebP, AVIF, TIFF
- Compress images with quality control
- Extract EXIF metadata and image stats
- Rotate, flip, crop, grayscale, blur

### Markdown Studio
- Convert between Markdown, HTML, and plain text
- Generate table of contents from headings
- Extract links and frontmatter
- Document statistics (words, headings, links, images)

### Archive Manager
- Upload and inspect ZIP archives
- List archive contents with sizes
- Extract files from archives
- Archive statistics (file count, total/compressed size)

### Regex Tester
- Test regex patterns against text with live matching
- Search and replace with regex
- Extract matching groups and captures
- Validate regex pattern syntax
- Configurable flags (global, case-insensitive, multiline)

### Diff & Patch
- Compare texts at line, word, or character level
- Generate unified diff format
- Apply patches to source text
- Diff statistics (additions, deletions, unchanged)

### SQL Studio
- Format and pretty-print SQL queries
- Minify SQL
- Validate SQL syntax
- Parse SQL to AST
- Convert between dialects (PostgreSQL, MySQL, SQLite, TransactSQL, BigQuery)
- Query statistics (tables, columns, joins)

### Crypto & Encoding
- Hash text with MD5, SHA-1, SHA-256, SHA-384, SHA-512
- Encode/decode Base64, Hex, URL, HTML
- Decode JWT tokens (header + payload)
- Generate cryptographically secure UUID v4
- HMAC signatures and file checksums

### Date/Time Tools
- Parse date strings and timestamps
- Format dates with custom patterns
- Date arithmetic (add/subtract days, hours, etc.)
- Calculate differences between dates
- Convert between timezones
- Parse and explain cron expressions

### Text Utilities
- Convert text case (upper, lower, title, sentence, camel, snake, kebab)
- Generate URL-friendly slugs
- Generate lorem ipsum placeholder text
- Calculate text similarity (Levenshtein distance)
- Text statistics (characters, words, sentences, paragraphs)
- Render mustache-style templates
- Truncate text with ellipsis options

### Math Utilities
- Convert between number bases (binary, octal, decimal, hex)
- Unit conversion (length, weight, temperature, data size)
- Number formatting with locale support
- Percentage calculations
- Statistical functions (mean, median, mode, std dev, variance)

### Color Utilities
- Parse colors from various formats (hex, rgb, hsl, named)
- Convert between color formats
- Check WCAG contrast ratios for accessibility
- Blend and mix colors
- Generate color palettes (complementary, triadic, analogous)
- Get nearest named color

---

## Agent Integration

Agent Tools supports three integration patterns:

### 1. MCP (Model Context Protocol)

Expose tools to Claude Desktop, Claude Code, or any MCP-compatible client.

**Supported transports:**
- **stdio** - For local process communication
- **SSE** - Server-Sent Events for web clients
- **HTTP Streaming** - Streamable HTTP for scalable deployments

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "agent-tools": {
      "command": "npx",
      "args": ["@agent-tools/mcp-server"]
    }
  }
}
```

**Available MCP Tools (100):**

<details>
<summary><strong>View all MCP tools</strong></summary>

| Tool | Description |
|------|-------------|
| **JSON** | |
| `agent_tools_json_format` | Format JSON with options |
| `agent_tools_json_validate` | Validate against JSON Schema |
| `agent_tools_json_query` | Query with JSONPath/JMESPath |
| `agent_tools_json_convert` | Convert between formats |
| `agent_tools_json_diff` | Compare two JSON documents |
| **CSV** | |
| `agent_tools_csv_parse` | Parse CSV to structured data |
| `agent_tools_csv_to_json` | Convert CSV to JSON |
| `agent_tools_csv_filter` | Filter CSV rows |
| `agent_tools_csv_stats` | Get column statistics |
| **PDF** | |
| `agent_tools_pdf_merge` | Merge PDF files |
| `agent_tools_pdf_split` | Split PDF by ranges |
| `agent_tools_pdf_extract_text` | Extract text from PDF |
| `agent_tools_pdf_metadata` | Get/set PDF metadata |
| `agent_tools_pdf_to_template` | Extract reusable template from PDF |
| `agent_tools_pdf_from_template` | Generate PDF from template + data |
| **XML** | |
| `agent_tools_xml_parse` | Parse XML to JSON |
| `agent_tools_xml_format` | Format/pretty-print XML |
| `agent_tools_xml_minify` | Minify XML |
| `agent_tools_xml_validate` | Validate XML structure |
| `agent_tools_xml_query` | Query XML with path expressions |
| `agent_tools_xml_convert` | Convert between XML and JSON |
| `agent_tools_xml_stats` | Get XML statistics |
| **Excel** | |
| `agent_tools_excel_parse` | Parse Excel to structured data |
| `agent_tools_excel_convert` | Convert to JSON/CSV/TSV |
| `agent_tools_excel_stats` | Get workbook statistics |
| `agent_tools_excel_sheets` | List sheet names and info |
| `agent_tools_excel_create` | Create Excel from JSON data |
| **Image** | |
| `agent_tools_image_resize` | Resize images |
| `agent_tools_image_crop` | Crop images to region |
| `agent_tools_image_convert` | Convert between formats |
| `agent_tools_image_compress` | Compress images |
| `agent_tools_image_rotate` | Rotate images |
| `agent_tools_image_metadata` | Extract image metadata |
| `agent_tools_image_grayscale` | Convert to grayscale |
| **Markdown** | |
| `agent_tools_markdown_convert` | Convert Markdown/HTML/text |
| `agent_tools_markdown_toc` | Generate table of contents |
| `agent_tools_markdown_links` | Extract all links |
| `agent_tools_markdown_frontmatter` | Extract frontmatter |
| `agent_tools_markdown_stats` | Get document statistics |
| **Archive** | |
| `agent_tools_archive_create` | Create ZIP archives |
| `agent_tools_archive_extract` | Extract archive contents |
| `agent_tools_archive_list` | List archive entries |
| `agent_tools_archive_stats` | Get archive statistics |
| **Regex** | |
| `agent_tools_regex_test` | Test pattern against text |
| `agent_tools_regex_replace` | Search and replace with regex |
| `agent_tools_regex_extract` | Extract matching groups |
| `agent_tools_regex_validate` | Validate regex syntax |
| **Diff** | |
| `agent_tools_diff_compare` | Compare texts (line/word/char) |
| `agent_tools_diff_unified` | Generate unified diff |
| `agent_tools_diff_apply` | Apply patches |
| **SQL** | |
| `agent_tools_sql_format` | Format SQL queries |
| `agent_tools_sql_minify` | Minify SQL |
| `agent_tools_sql_parse` | Parse SQL to AST |
| `agent_tools_sql_validate` | Validate SQL syntax |
| `agent_tools_sql_convert` | Convert between dialects |
| `agent_tools_sql_stats` | Get query statistics |
| **Crypto & Encoding** | |
| `agent_tools_crypto_hash` | Hash text (MD5, SHA-256, etc.) |
| `agent_tools_crypto_hmac` | Generate HMAC signatures |
| `agent_tools_crypto_encode` | Encode (Base64, Hex, URL, HTML) |
| `agent_tools_crypto_decode` | Decode encoded text |
| `agent_tools_crypto_jwt_decode` | Decode JWT tokens |
| `agent_tools_crypto_uuid` | Generate UUID v4 |
| `agent_tools_crypto_checksum` | Compute file checksums |
| **Date/Time** | |
| `agent_tools_datetime_parse` | Parse date strings |
| `agent_tools_datetime_format` | Format dates |
| `agent_tools_datetime_now` | Get current date/time |
| `agent_tools_datetime_add` | Add duration to dates |
| `agent_tools_datetime_subtract` | Subtract duration |
| `agent_tools_datetime_diff` | Calculate date differences |
| `agent_tools_datetime_timezone_convert` | Convert timezones |
| `agent_tools_datetime_cron` | Parse cron expressions |
| `agent_tools_datetime_timezones` | List all timezones |
| **Text** | |
| `agent_tools_text_case` | Convert text case |
| `agent_tools_text_slugify` | Generate URL slugs |
| `agent_tools_text_lorem` | Generate lorem ipsum |
| `agent_tools_text_similarity` | Calculate text similarity |
| `agent_tools_text_stats` | Get text statistics |
| `agent_tools_text_template` | Render text templates |
| `agent_tools_text_truncate` | Truncate text |
| **Math** | |
| `agent_tools_math_base` | Convert number bases |
| `agent_tools_math_convert` | Convert units |
| `agent_tools_math_format` | Format numbers |
| `agent_tools_math_percentage` | Calculate percentages |
| `agent_tools_math_statistics` | Calculate statistics |
| **Color** | |
| `agent_tools_color_parse` | Parse color strings |
| `agent_tools_color_convert` | Convert color formats |
| `agent_tools_color_contrast` | Check contrast ratio |
| `agent_tools_color_blend` | Blend colors |
| `agent_tools_color_palette` | Generate palettes |
| `agent_tools_color_name` | Get color name |

</details>

### 2. A2A (Agent-to-Agent Protocol)

Agent Tools exposes an A2A-compliant agent for inter-agent communication.

```bash
# Discover agent capabilities
curl https://your-agent-tools-instance/.well-known/agent.json

# Create a task
curl -X POST https://your-agent-tools-instance/a2a/tasks \
  -H "Content-Type: application/json" \
  -d '{"skill": "json-operations", "input": {"action": "format", "data": "..."}}'

# Poll for result
curl https://your-agent-tools-instance/a2a/tasks/{task_id}
```

### 3. REST API

Direct HTTP access to all tools. No external API keys or services required — everything runs locally.

```bash
# Format JSON
curl -X POST /api/json/format \
  -H "Content-Type: application/json" \
  -d '{"input": "{\"a\":1}", "options": {"indent": 2}}'

# Format SQL
curl -X POST /api/sql/format \
  -H "Content-Type: application/json" \
  -d '{"input": "SELECT * FROM users WHERE active=true", "dialect": "postgresql"}'

# Hash text
curl -X POST /api/crypto/hash \
  -H "Content-Type: application/json" \
  -d '{"input": "hello world", "algorithm": "sha256"}'

# Parse date
curl -X POST /api/datetime/parse \
  -H "Content-Type: application/json" \
  -d '{"input": "2024-01-15T10:30:00Z", "timezone": "America/New_York"}'

# Test regex
curl -X POST /api/regex/test \
  -H "Content-Type: application/json" \
  -d '{"input": "hello world", "pattern": "\\w+", "flags": "g"}'
```

**Available REST endpoints:** `/api/{tool}/{action}` where tool is one of: `json`, `csv`, `pdf`, `xml`, `excel`, `image`, `markdown`, `archive`, `regex`, `diff`, `sql`, `crypto`, `datetime`, `text`, `math`, `color`.

---

## Installation

### Prerequisites

- Node.js 20+
- pnpm 9+

### Local Development

```bash
# Clone the repository
git clone git@github.com:AtmaticAI/agent-tools.git
cd agent-tools

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Start specific services
pnpm dev:web    # Web UI only
pnpm dev:mcp    # MCP server only
```

### Docker

```bash
# Full platform (Web + MCP + A2A)
docker-compose up -d

# Web UI only
docker run -p 3000:3000 ghcr.io/AtmaticAI/agent-tools:latest

# MCP server only
docker run ghcr.io/AtmaticAI/agent-tools:mcp
```

#### Docker Compose

```yaml
version: '3.8'
services:
  agent-tools:
    image: ghcr.io/AtmaticAI/agent-tools:latest
    ports:
      - "3000:3000"  # Web UI
      - "3001:3001"  # MCP HTTP Streaming
    volumes:
      - ./data:/app/data  # Persist runtime settings
```

### Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/

# Verify deployment
kubectl get pods -n agent-tools
kubectl get svc -n agent-tools
```

#### Kubernetes Manifests

The `k8s/` directory includes:
- `namespace.yaml` - Agent Tools namespace
- `configmap.yaml` - Configuration
- `deployment.yaml` - Main deployment
- `service.yaml` - ClusterIP service
- `ingress.yaml` - Ingress with TLS
- `hpa.yaml` - Horizontal Pod Autoscaler

### AWS (ECS/Fargate)

```bash
cd terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan

# Deploy
terraform apply
```

#### Terraform Resources

- **ECR** - Container registry
- **ECS Cluster** - Fargate cluster
- **ECS Service** - Auto-scaled service
- **ALB** - Application Load Balancer
- **CloudWatch** - Logging and metrics

---

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Web server port |
| `MCP_PORT` | `3001` | MCP HTTP streaming port |
| `MCP_TRANSPORT` | `stdio` | MCP transport: `stdio`, `sse`, `http` |

Tool categories (JSON, CSV, PDF, XML, Excel, Image, Markdown, Archive, Regex, Diff, SQL, Crypto, DateTime) are configured at runtime via the **Settings** page (`/settings`). All tools are enabled by default. Settings are persisted to `data/settings.json`.

---

## MCP Server

### Installation

```bash
# Global install
npm install -g @agent-tools/mcp-server

# Or run directly
npx @agent-tools/mcp-server
```

### Transport Options

#### stdio (default)
For Claude Desktop and local integrations:

```json
{
  "mcpServers": {
    "agent-tools": {
      "command": "npx",
      "args": ["@agent-tools/mcp-server"]
    }
  }
}
```

#### SSE (Server-Sent Events)
For web-based MCP clients:

```bash
npx @agent-tools/mcp-server --transport sse --port 3001
```

#### HTTP Streaming
For scalable, stateless deployments:

```bash
npx @agent-tools/mcp-server --transport http --port 3001
```

Connect via:
```
POST http://localhost:3001/mcp
Content-Type: application/json

{"jsonrpc": "2.0", "method": "tools/list", "id": 1}
```

---

## A2A Agent

### Agent Card

The A2A agent card is available at `/.well-known/agent.json`:

```json
{
  "name": "Agent Tools Data Agent",
  "description": "Deterministic data transformation and document processing",
  "version": "1.0.0",
  "provider": {
    "organization": "atmatic.ai",
    "url": "https://atmatic.ai"
  },
  "capabilities": {
    "streaming": true,
    "pushNotifications": false
  },
  "skills": [
    { "id": "json-operations", "name": "JSON Processing" },
    { "id": "csv-operations", "name": "CSV Processing" },
    { "id": "pdf-operations", "name": "PDF Processing" },
    { "id": "xml-operations", "name": "XML Processing" },
    { "id": "excel-operations", "name": "Excel Processing" },
    { "id": "image-operations", "name": "Image Processing" },
    { "id": "markdown-operations", "name": "Markdown Processing" },
    { "id": "archive-operations", "name": "Archive Management" },
    { "id": "regex-operations", "name": "Regex Operations" },
    { "id": "diff-operations", "name": "Diff & Patch" },
    { "id": "sql-operations", "name": "SQL Processing" },
    { "id": "crypto-operations", "name": "Crypto & Encoding" },
    { "id": "datetime-operations", "name": "Date/Time Operations" },
    { "id": "text-operations", "name": "Text Processing" },
    { "id": "math-operations", "name": "Math Operations" },
    { "id": "color-operations", "name": "Color Operations" }
  ]
}
```

### Task Lifecycle

```
POST /a2a/tasks          → Create task (returns task_id)
GET  /a2a/tasks/:id      → Get task status/result
POST /a2a/tasks/:id/cancel → Cancel task
```

---

## Coming Soon: a2ui.org Integration

[a2ui.org](https://a2ui.org) is an emerging standard for agent user interfaces. Agent Tools will integrate as a data transformation provider within the a2ui ecosystem.

### Planned Features
- **Direct Connection**: Register Agent Tools as a tool provider in a2ui-compatible agents
- **Seamless Handoffs**: Pass data between a2ui agents and Agent Tools tools
- **Visual Workflows**: Chain all 16 tool categories in visual pipelines

Stay tuned for updates on [GitHub](https://github.com/AtmaticAI/agent-tools).

---

## Project Structure

```
agent-tools/
├── apps/
│   └── web/                        # Next.js 15 application
│       ├── app/
│       │   ├── (dashboard)/        # Tool UI pages (16 tools)
│       │   │   ├── json/           # JSON Studio
│       │   │   ├── csv/            # CSV Viewer
│       │   │   ├── pdf/            # PDF Toolkit
│       │   │   ├── xml/            # XML Studio
│       │   │   ├── excel/          # Excel Viewer
│       │   │   ├── image/          # Image Toolkit
│       │   │   ├── markdown/       # Markdown Studio
│       │   │   ├── archive/        # Archive Manager
│       │   │   ├── regex/          # Regex Tester
│       │   │   ├── diff/           # Diff & Patch
│       │   │   ├── sql/            # SQL Studio
│       │   │   ├── crypto/         # Crypto & Encoding
│       │   │   ├── datetime/       # Date/Time Tools
│       │   │   ├── connect/        # Integration guide
│       │   │   └── settings/       # Runtime tool settings
│       │   └── api/                # REST API routes
│       ├── components/             # React components (shadcn/ui)
│       └── lib/                    # Utilities and stores
├── packages/
│   ├── core/                       # Shared business logic (16 modules)
│   ├── mcp-server/                 # MCP server (100 tools)
│   └── a2a-agent/                  # A2A agent (16 skills)
├── docker/                         # Docker configurations
├── k8s/                            # Kubernetes manifests
├── terraform/                      # AWS infrastructure
└── .github/workflows/              # CI/CD pipelines
```

---

## Development

### Commands

```bash
pnpm dev          # Start all services
pnpm build        # Build all packages
pnpm test         # Run tests
pnpm lint         # Lint code
pnpm typecheck    # Type check
pnpm format       # Format code
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test -- --coverage
```

---

## Managed Solution

Looking for a hosted, fully managed version of Agent Tools without the hassle of self-hosting?

**[Atmatic.ai](https://atmatic.ai)** offers a managed platform with enterprise-grade features including team collaboration, usage analytics, priority support, and guaranteed uptime — so you can focus on building agents, not infrastructure.

### Open Source vs Managed Platform

| Feature | Open Source | Managed Platform |
|---------|-------------|------------------|
| All 16 tool categories | Yes | Yes |
| MCP / A2A / REST APIs | Yes | Yes |
| Self-hosted | Yes | No (cloud-hosted) |
| Automatic updates | Manual | Yes |
| Team collaboration | - | Yes |
| Usage analytics | - | Yes |
| Priority support | Community | Dedicated |
| SLA & uptime guarantee | - | Yes |

**[See full comparison →](https://atmatic.ai/tools)**

**[Contact us for enterprise pricing →](https://atmatic.ai/#contact-us)**

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

Apache 2.0 License - see [LICENSE](./LICENSE) for details.

---

## Links

- **Live Demo**: [tools.atmatic.ai](https://tools.atmatic.ai)
- **Repository**: [github.com/AtmaticAI/agent-tools](https://github.com/AtmaticAI/agent-tools)
- **Organization**: [atmatic.ai](https://atmatic.ai)
- **Managed Platform**: [atmatic.ai/tools](https://atmatic.ai/tools)
- **Issues**: [github.com/AtmaticAI/agent-tools/issues](https://github.com/AtmaticAI/agent-tools/issues)
- **Contact**: [atmatic.ai/#contact-us](https://atmatic.ai/#contact-us)

---

<p align="center">
  <strong>Agent Tools</strong> — An open source project by <a href="https://atmatic.ai">atmatic.ai</a>
  <br>
  <sub>Building trust through transparency</sub>
</p>
