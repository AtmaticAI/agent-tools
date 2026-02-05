#!/bin/bash
# Test utilities and helper functions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Configuration
BASE_URL="${BASE_URL:-http://localhost:3000}"
MCP_PORT="${MCP_PORT:-3001}"
A2A_PORT="${A2A_PORT:-3002}"
SCREENSHOT_DIR="${SCREENSHOT_DIR:-$(dirname "$0")/../../screenshots}"
TIMEOUT="${TIMEOUT:-30000}"

# Print functions
print_header() {
    echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}\n"
}

print_test() {
    echo -e "${YELLOW}▶ Testing:${NC} $1"
}

print_pass() {
    echo -e "${GREEN}✓ PASS:${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_fail() {
    echo -e "${RED}✗ FAIL:${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

print_skip() {
    echo -e "${YELLOW}⊘ SKIP:${NC} $1"
    TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
}

print_info() {
    echo -e "${BLUE}ℹ INFO:${NC} $1"
}

# Print test summary
print_summary() {
    echo -e "\n${BLUE}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  TEST SUMMARY${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  Passed:  $TESTS_PASSED${NC}"
    echo -e "${RED}  Failed:  $TESTS_FAILED${NC}"
    echo -e "${YELLOW}  Skipped: $TESTS_SKIPPED${NC}"
    echo -e "${BLUE}  Total:   $((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))${NC}"
    echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}\n"

    if [ $TESTS_FAILED -gt 0 ]; then
        return 1
    fi
    return 0
}

# Wait for server to be ready
wait_for_server() {
    local url="$1"
    local max_attempts="${2:-30}"
    local attempt=0

    print_info "Waiting for server at $url..."
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_info "Server is ready"
            return 0
        fi
        sleep 1
        attempt=$((attempt + 1))
    done
    print_fail "Server not ready after $max_attempts seconds"
    return 1
}

# Assert functions
assert_equals() {
    local expected="$1"
    local actual="$2"
    local message="$3"

    if [ "$expected" = "$actual" ]; then
        print_pass "$message"
        return 0
    else
        print_fail "$message (expected: '$expected', got: '$actual')"
        return 1
    fi
}

assert_contains() {
    local haystack="$1"
    local needle="$2"
    local message="$3"

    if [[ "$haystack" == *"$needle"* ]]; then
        print_pass "$message"
        return 0
    else
        print_fail "$message (expected to contain: '$needle')"
        return 1
    fi
}

assert_not_empty() {
    local value="$1"
    local message="$2"

    if [ -n "$value" ]; then
        print_pass "$message"
        return 0
    else
        print_fail "$message (value is empty)"
        return 1
    fi
}

assert_http_status() {
    local url="$1"
    local expected_status="$2"
    local message="$3"
    local method="${4:-GET}"
    local data="$5"

    local status
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        status=$(curl -s -o /dev/null -w "%{http_code}" -X POST -H "Content-Type: application/json" -d "$data" "$url")
    else
        status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    fi

    assert_equals "$expected_status" "$status" "$message"
}

# JSON helper functions
json_get() {
    local json="$1"
    local path="$2"
    echo "$json" | jq -r "$path" 2>/dev/null
}

# Browser helper - run agent-browser command with common options
browser() {
    agent-browser --headed "$@"
}

# Browser helper for fullscreen screenshots
browser_screenshot() {
    local name="$1"
    local output_path="$SCREENSHOT_DIR/$name.png"
    agent-browser --headed screenshot "$output_path" --full
    if [ -f "$output_path" ]; then
        print_pass "Screenshot saved: $name.png"
        return 0
    else
        print_fail "Failed to save screenshot: $name.png"
        return 1
    fi
}

# Export functions
export -f print_header print_test print_pass print_fail print_skip print_info
export -f print_summary wait_for_server
export -f assert_equals assert_contains assert_not_empty assert_http_status
export -f json_get browser browser_screenshot
