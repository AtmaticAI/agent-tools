#!/bin/bash
# Install git hooks for Agent Tools

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Installing git hooks...${NC}"

# Create hooks directory if it doesn't exist
mkdir -p "$GIT_HOOKS_DIR"

# Create pre-commit hook
cat > "$GIT_HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash
# Pre-commit hook - runs tests before commit

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Run pre-commit tests
if [ -f "$PROJECT_ROOT/tests/pre-commit-hook.sh" ]; then
    exec "$PROJECT_ROOT/tests/pre-commit-hook.sh"
else
    echo "Warning: pre-commit-hook.sh not found"
    exit 0
fi
EOF

chmod +x "$GIT_HOOKS_DIR/pre-commit"

echo -e "${GREEN}✓ Pre-commit hook installed${NC}"

# Make all test scripts executable
chmod +x "$SCRIPT_DIR/run-tests.sh"
chmod +x "$SCRIPT_DIR/pre-commit-hook.sh"
chmod +x "$SCRIPT_DIR/lib/test-utils.sh"
chmod +x "$SCRIPT_DIR/fixtures/test-data.sh"
chmod +x "$SCRIPT_DIR/ui/test-ui.sh"
chmod +x "$SCRIPT_DIR/api/test-api.sh"
chmod +x "$SCRIPT_DIR/mcp/test-mcp.sh"
chmod +x "$SCRIPT_DIR/a2a/test-a2a.sh"

echo -e "${GREEN}✓ Test scripts made executable${NC}"

echo -e "\n${GREEN}Installation complete!${NC}"
echo ""
echo "Usage:"
echo "  Run all tests:        ./tests/run-tests.sh"
echo "  Run UI tests only:    ./tests/run-tests.sh --ui-only"
echo "  Run API tests only:   ./tests/run-tests.sh --api-only"
echo "  Update screenshots:   ./tests/run-tests.sh --ui-only --update-screenshots"
echo ""
echo "The pre-commit hook will automatically run on 'git commit'"
