# Agent Tools Test Framework

Comprehensive testing framework for Agent Tools covering UI, REST API, MCP Server, and A2A Agent.

## Quick Start

```bash
# Install git hooks
./tests/install-hooks.sh

# Run all tests
./tests/run-tests.sh

# Run specific test suites
./tests/run-tests.sh --ui-only
./tests/run-tests.sh --api-only
./tests/run-tests.sh --mcp-only
./tests/run-tests.sh --a2a-only
```

## Prerequisites

1. **Development server running:**
   ```bash
   ./run-dev.sh
   ```

2. **agent-browser installed:**
   ```bash
   npm install -g agent-browser
   agent-browser install
   ```

## Test Structure

```
tests/
├── run-tests.sh          # Main test runner
├── pre-commit-hook.sh    # Pre-commit validation
├── install-hooks.sh      # Git hook installer
├── lib/
│   └── test-utils.sh     # Shared test utilities
├── fixtures/
│   └── test-data.sh      # Test data fixtures
├── ui/
│   └── test-ui.sh        # UI tests using agent-browser
├── api/
│   └── test-api.sh       # REST API tests
├── mcp/
│   └── test-mcp.sh       # MCP server tests
└── a2a/
    └── test-a2a.sh       # A2A agent tests
```

## Test Suites

### UI Tests (`tests/ui/test-ui.sh`)

Tests all 16 tool pages using `agent-browser` for browser automation:

- **Homepage** - Navigation links, tool cards
- **JSON Studio** - Format, validate, minify, convert, query
- **Crypto & Encoding** - Hash, encode/decode, JWT, UUID
- **SQL Studio** - Format, validate, parse
- **Regex Tester** - Test, replace, extract
- **Diff & Patch** - Compare texts, unified diff
- **CSV Viewer** - Parse, filter, convert
- **DateTime Tools** - Parse, convert timezone, cron
- **Markdown Studio** - Convert to HTML, TOC
- **XML Studio** - Format, validate, convert
- **Color Utilities** - Parse, contrast, palette
- **Text Utilities** - Case, slugify, stats
- **Math Utilities** - Unit convert, statistics
- **PDF Toolkit** - Page loads
- **Excel Viewer** - Page loads
- **Image Toolkit** - Page loads
- **Archive Manager** - Page loads
- **Settings** - Page loads

### API Tests (`tests/api/test-api.sh`)

Tests all REST API endpoints:

```
POST /api/json/format
POST /api/json/validate
POST /api/json/query
POST /api/json/convert
POST /api/crypto/hash
POST /api/crypto/encode
POST /api/crypto/jwt
POST /api/crypto/uuid
POST /api/sql/format
POST /api/sql/parse
POST /api/csv/parse
POST /api/csv/convert
POST /api/regex/test
POST /api/regex/replace
POST /api/diff/create
POST /api/datetime/parse
POST /api/datetime/convert
POST /api/markdown/convert
POST /api/xml/format
POST /api/xml/parse
POST /api/color/parse
POST /api/color/contrast
POST /api/text/case
POST /api/text/slugify
POST /api/math/convert
POST /api/math/statistics
GET  /api/settings
```

### MCP Tests (`tests/mcp/test-mcp.sh`)

Tests MCP protocol via HTTP transport:

- `initialize` - Session initialization
- `tools/list` - List available tools
- `tools/call` - Call various tools:
  - `agent_tools_json_format`
  - `agent_tools_crypto_hash`
  - `agent_tools_sql_format`
  - `agent_tools_regex_test`
  - `agent_tools_datetime_parse`
  - `agent_tools_color_parse`
  - `agent_tools_text_case`
  - `agent_tools_math_statistics`
- Error handling

### A2A Tests (`tests/a2a/test-a2a.sh`)

Tests A2A protocol:

- `GET /.well-known/agent.json` - Agent card
- `tasks/send` - Send tasks
- `tasks/get` - Get task status
- Skill-specific tests
- Error handling

## Options

```bash
./tests/run-tests.sh [options]

Options:
  --ui-only             Run only UI tests
  --api-only            Run only API tests
  --mcp-only            Run only MCP tests
  --a2a-only            Run only A2A tests
  --no-ui               Skip UI tests
  --no-api              Skip API tests
  --no-mcp              Skip MCP tests
  --no-a2a              Skip A2A tests
  --update-screenshots  Update screenshot files
  --headless            Run browser in headless mode
  --help                Show help
```

## Environment Variables

```bash
BASE_URL=http://localhost:3000    # Web app URL
MCP_PORT=3001                     # MCP server port
A2A_PORT=3002                     # A2A agent port
SCREENSHOT_DIR=./screenshots      # Screenshot output directory
```

## Screenshots

UI tests automatically update screenshots in the `screenshots/` directory:

- `homepage.png`
- `json-studio.png`
- `crypto-encoding.png`
- `sql-studio.png`
- `regex-tester.png`
- `diff-patch.png`
- `csv-viewer.png`
- `datetime-tools.png`
- `markdown-studio.png`
- `xml-studio.png`
- `color-utilities.png`
- `text-utilities.png`
- `math-utilities.png`
- `pdf-toolkit.png`
- `excel-viewer.png`
- `image-toolkit.png`
- `archive-manager.png`
- `settings.png`

## Pre-commit Hook

The pre-commit hook runs:

1. **Lint check** - `pnpm lint`
2. **Type check** - `pnpm type-check`
3. **Build check** - `pnpm build`
4. **API tests** - Quick API validation (if server running)

Install with:
```bash
./tests/install-hooks.sh
```

## Adding New Tests

### UI Test

Add to `tests/ui/test-ui.sh`:

```bash
test_new_feature() {
    print_header "NEW FEATURE TESTS"

    agent-browser --headed open "$BASE_URL/new-feature"
    sleep 2

    print_test "Test description"
    agent-browser --headed fill "input" "test data"
    agent-browser --headed click "button:has-text('Submit')"

    local result=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$result" == *"expected"* ]]; then
        print_pass "Test passed"
    else
        print_fail "Test failed"
    fi

    agent-browser --headed screenshot "$SCREENSHOT_DIR/new-feature.png" --full
}
```

### API Test

Add to `tests/api/test-api.sh`:

```bash
test_new_api() {
    print_header "NEW API TESTS"

    print_test "POST /api/new-endpoint"
    local response=$(curl -s -X POST "$BASE_URL/api/new-endpoint" \
        -H "Content-Type: application/json" \
        -d '{"key": "value"}')

    if [[ "$response" == *"expected"* ]]; then
        print_pass "API works"
    else
        print_fail "API failed: $response"
    fi
}
```

## Test Data

Test fixtures are in `tests/fixtures/test-data.sh`:

- `JSON_VALID`, `JSON_NESTED`, `JSON_ARRAY`
- `CSV_SIMPLE`, `CSV_WITH_QUOTES`
- `SQL_SELECT`, `SQL_INSERT`, `SQL_COMPLEX`
- `XML_SIMPLE`, `XML_WITH_ATTRS`
- `MARKDOWN_SIMPLE`
- `REGEX_EMAIL_PATTERN`, `REGEX_TEST_TEXT`
- `DIFF_ORIGINAL`, `DIFF_MODIFIED`
- `DATETIME_ISO`, `DATETIME_UNIX`, `DATETIME_CRON`
- `CRYPTO_TEXT`, `CRYPTO_JWT`
- `COLOR_HEX`, `COLOR_RGB`, `COLOR_HSL`
- And more...

## Troubleshooting

### Browser tests failing

```bash
# Reinstall browser
agent-browser install --with-deps

# Check browser is working
agent-browser --headed open https://example.com
```

### Server not responding

```bash
# Start development server
./run-dev.sh

# Check server status
curl http://localhost:3000/api/settings
```

### MCP/A2A tests skipped

Start the respective servers:
```bash
# MCP server
pnpm --filter @atmaticai/agent-tools dev

# A2A agent
pnpm --filter @atmaticai/agent-tools-a2a dev
```
