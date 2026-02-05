#!/bin/bash
# Main Test Runner
# Orchestrates UI, API, MCP, and A2A tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/test-utils.sh"

# Default configuration
RUN_UI_TESTS=${RUN_UI_TESTS:-true}
RUN_API_TESTS=${RUN_API_TESTS:-true}
RUN_MCP_TESTS=${RUN_MCP_TESTS:-true}
RUN_A2A_TESTS=${RUN_A2A_TESTS:-true}
UPDATE_SCREENSHOTS=${UPDATE_SCREENSHOTS:-false}
HEADLESS=${HEADLESS:-false}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --ui-only)
            RUN_UI_TESTS=true
            RUN_API_TESTS=false
            RUN_MCP_TESTS=false
            RUN_A2A_TESTS=false
            shift
            ;;
        --api-only)
            RUN_UI_TESTS=false
            RUN_API_TESTS=true
            RUN_MCP_TESTS=false
            RUN_A2A_TESTS=false
            shift
            ;;
        --mcp-only)
            RUN_UI_TESTS=false
            RUN_API_TESTS=false
            RUN_MCP_TESTS=true
            RUN_A2A_TESTS=false
            shift
            ;;
        --a2a-only)
            RUN_UI_TESTS=false
            RUN_API_TESTS=false
            RUN_MCP_TESTS=false
            RUN_A2A_TESTS=true
            shift
            ;;
        --no-ui)
            RUN_UI_TESTS=false
            shift
            ;;
        --no-api)
            RUN_API_TESTS=false
            shift
            ;;
        --no-mcp)
            RUN_MCP_TESTS=false
            shift
            ;;
        --no-a2a)
            RUN_A2A_TESTS=false
            shift
            ;;
        --update-screenshots)
            UPDATE_SCREENSHOTS=true
            shift
            ;;
        --headless)
            HEADLESS=true
            shift
            ;;
        --help|-h)
            echo "Agent Tools Test Runner"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --ui-only             Run only UI tests"
            echo "  --api-only            Run only API tests"
            echo "  --mcp-only            Run only MCP tests"
            echo "  --a2a-only            Run only A2A tests"
            echo "  --no-ui               Skip UI tests"
            echo "  --no-api              Skip API tests"
            echo "  --no-mcp              Skip MCP tests"
            echo "  --no-a2a              Skip A2A tests"
            echo "  --update-screenshots  Update screenshot files"
            echo "  --headless            Run browser tests in headless mode"
            echo "  --help, -h            Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  BASE_URL              Web app URL (default: http://localhost:3000)"
            echo "  MCP_PORT              MCP server port (default: 3001)"
            echo "  A2A_PORT              A2A server port (default: 3002)"
            echo "  SCREENSHOT_DIR        Screenshot output directory"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Export configuration for child scripts
export BASE_URL MCP_PORT A2A_PORT SCREENSHOT_DIR UPDATE_SCREENSHOTS HEADLESS

# Track overall results
TOTAL_PASSED=0
TOTAL_FAILED=0
TOTAL_SKIPPED=0

# Run a test suite and track results
run_suite() {
    local name="$1"
    local script="$2"

    print_header "Running $name"

    if [ -x "$script" ]; then
        if "$script"; then
            print_pass "$name completed successfully"
        else
            print_fail "$name had failures"
            return 1
        fi
    else
        print_fail "Test script not found or not executable: $script"
        return 1
    fi
}

# Main function
main() {
    print_header "AGENT TOOLS TEST SUITE"
    echo "Configuration:"
    echo "  BASE_URL: ${BASE_URL:-http://localhost:3000}"
    echo "  MCP_PORT: ${MCP_PORT:-3001}"
    echo "  A2A_PORT: ${A2A_PORT:-3002}"
    echo "  UI Tests: $RUN_UI_TESTS"
    echo "  API Tests: $RUN_API_TESTS"
    echo "  MCP Tests: $RUN_MCP_TESTS"
    echo "  A2A Tests: $RUN_A2A_TESTS"
    echo "  Update Screenshots: $UPDATE_SCREENSHOTS"
    echo ""

    local exit_code=0

    # Make test scripts executable
    chmod +x "$SCRIPT_DIR/ui/test-ui.sh" 2>/dev/null || true
    chmod +x "$SCRIPT_DIR/api/test-api.sh" 2>/dev/null || true
    chmod +x "$SCRIPT_DIR/mcp/test-mcp.sh" 2>/dev/null || true
    chmod +x "$SCRIPT_DIR/a2a/test-a2a.sh" 2>/dev/null || true

    # Run API tests
    if [ "$RUN_API_TESTS" = "true" ]; then
        if ! run_suite "API Tests" "$SCRIPT_DIR/api/test-api.sh"; then
            exit_code=1
        fi
    else
        print_skip "API tests (disabled)"
    fi

    # Run MCP tests
    if [ "$RUN_MCP_TESTS" = "true" ]; then
        if ! run_suite "MCP Tests" "$SCRIPT_DIR/mcp/test-mcp.sh"; then
            exit_code=1
        fi
    else
        print_skip "MCP tests (disabled)"
    fi

    # Run A2A tests
    if [ "$RUN_A2A_TESTS" = "true" ]; then
        if ! run_suite "A2A Tests" "$SCRIPT_DIR/a2a/test-a2a.sh"; then
            exit_code=1
        fi
    else
        print_skip "A2A tests (disabled)"
    fi

    # Run UI tests (last, as they're slowest)
    if [ "$RUN_UI_TESTS" = "true" ]; then
        if ! run_suite "UI Tests" "$SCRIPT_DIR/ui/test-ui.sh"; then
            exit_code=1
        fi
    else
        print_skip "UI tests (disabled)"
    fi

    # Final summary
    print_header "FINAL RESULTS"
    if [ $exit_code -eq 0 ]; then
        echo -e "${GREEN}All test suites passed!${NC}"
    else
        echo -e "${RED}Some test suites failed!${NC}"
    fi

    return $exit_code
}

# Run main function
main "$@"
