#!/bin/bash
# Pre-commit hook for Agent Tools
# Runs quick tests before allowing commits

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Running pre-commit tests...${NC}"

# Check if servers are running
check_server() {
    local url="$1"
    local name="$2"
    if curl -s "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Quick lint check
echo -e "\n${YELLOW}[1/4] Running lint check...${NC}"
cd "$PROJECT_ROOT"
if pnpm lint 2>/dev/null; then
    echo -e "${GREEN}✓ Lint passed${NC}"
else
    echo -e "${RED}✗ Lint failed${NC}"
    echo -e "${YELLOW}Run 'pnpm lint:fix' to fix issues${NC}"
    exit 1
fi

# Type check
echo -e "\n${YELLOW}[2/4] Running type check...${NC}"
if pnpm type-check 2>/dev/null; then
    echo -e "${GREEN}✓ Type check passed${NC}"
else
    echo -e "${RED}✗ Type check failed${NC}"
    exit 1
fi

# Build check
echo -e "\n${YELLOW}[3/4] Running build check...${NC}"
if pnpm build 2>/dev/null; then
    echo -e "${GREEN}✓ Build passed${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Quick API tests (if server is running)
echo -e "\n${YELLOW}[4/4] Running quick API tests...${NC}"
if check_server "http://localhost:3000" "Web"; then
    # Run only API tests (fast)
    if "$SCRIPT_DIR/run-tests.sh" --api-only --no-ui 2>/dev/null; then
        echo -e "${GREEN}✓ API tests passed${NC}"
    else
        echo -e "${RED}✗ API tests failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⊘ Server not running, skipping API tests${NC}"
    echo -e "${YELLOW}  Start with: ./run-dev.sh${NC}"
fi

echo -e "\n${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  Pre-commit checks passed!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}\n"

exit 0
