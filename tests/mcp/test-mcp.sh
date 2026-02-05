#!/bin/bash
# MCP Server Test Suite
# Tests MCP protocol endpoints via HTTP transport

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/test-utils.sh"
source "$SCRIPT_DIR/../fixtures/test-data.sh"

# MCP server URL (HTTP transport)
MCP_URL="${MCP_URL:-http://localhost:$MCP_PORT}"

# ============================================================================
# MCP Initialize Tests
# ============================================================================
test_mcp_initialize() {
    print_header "MCP INITIALIZE TESTS"

    print_test "Initialize MCP session"
    local response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d "$MCP_INITIALIZE")

    if [[ "$response" == *"protocolVersion"* ]] || [[ "$response" == *"capabilities"* ]] || [[ "$response" == *"serverInfo"* ]]; then
        print_pass "MCP initialize works"
    else
        print_fail "MCP initialize failed: $response"
    fi
}

# ============================================================================
# MCP Tools List Tests
# ============================================================================
test_mcp_tools_list() {
    print_header "MCP TOOLS LIST TESTS"

    print_test "List available tools"
    local response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d "$MCP_TOOLS_LIST")

    # Check for tool categories
    local tools_found=0
    if [[ "$response" == *"agent_tools_json"* ]]; then
        print_pass "JSON tools listed"
        tools_found=$((tools_found + 1))
    fi

    if [[ "$response" == *"agent_tools_crypto"* ]]; then
        print_pass "Crypto tools listed"
        tools_found=$((tools_found + 1))
    fi

    if [[ "$response" == *"agent_tools_sql"* ]]; then
        print_pass "SQL tools listed"
        tools_found=$((tools_found + 1))
    fi

    if [[ "$response" == *"agent_tools_csv"* ]]; then
        print_pass "CSV tools listed"
        tools_found=$((tools_found + 1))
    fi

    if [[ "$response" == *"agent_tools_regex"* ]]; then
        print_pass "Regex tools listed"
        tools_found=$((tools_found + 1))
    fi

    if [ $tools_found -eq 0 ]; then
        print_fail "No tools found in response: $response"
    fi
}

# ============================================================================
# MCP Tool Call Tests
# ============================================================================
test_mcp_tool_calls() {
    print_header "MCP TOOL CALL TESTS"

    # Test: JSON Format
    print_test "Call agent_tools_json_format"
    local response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 10,
            "method": "tools/call",
            "params": {
                "name": "agent_tools_json_format",
                "arguments": {"json": "{\"a\":1}", "indent": 2}
            }
        }')

    if [[ "$response" == *"result"* ]] || [[ "$response" == *"formatted"* ]] || [[ "$response" == *"\"a\":"* ]]; then
        print_pass "JSON format tool works"
    else
        print_fail "JSON format tool failed: $response"
    fi

    # Test: Crypto Hash
    print_test "Call agent_tools_crypto_hash"
    response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 11,
            "method": "tools/call",
            "params": {
                "name": "agent_tools_crypto_hash",
                "arguments": {"input": "hello", "algorithm": "sha256"}
            }
        }')

    if [[ "$response" == *"hash"* ]] || [[ "$response" == *"2cf24"* ]]; then
        print_pass "Crypto hash tool works"
    else
        print_fail "Crypto hash tool failed: $response"
    fi

    # Test: SQL Format
    print_test "Call agent_tools_sql_format"
    response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 12,
            "method": "tools/call",
            "params": {
                "name": "agent_tools_sql_format",
                "arguments": {"sql": "SELECT * FROM users WHERE id=1"}
            }
        }')

    if [[ "$response" == *"SELECT"* ]] || [[ "$response" == *"formatted"* ]]; then
        print_pass "SQL format tool works"
    else
        print_fail "SQL format tool failed: $response"
    fi

    # Test: Regex Test
    print_test "Call agent_tools_regex_test"
    response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 13,
            "method": "tools/call",
            "params": {
                "name": "agent_tools_regex_test",
                "arguments": {"pattern": "\\\\d+", "input": "abc123"}
            }
        }')

    if [[ "$response" == *"match"* ]] || [[ "$response" == *"123"* ]]; then
        print_pass "Regex test tool works"
    else
        print_fail "Regex test tool failed: $response"
    fi

    # Test: DateTime Parse
    print_test "Call agent_tools_datetime_parse"
    response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 14,
            "method": "tools/call",
            "params": {
                "name": "agent_tools_datetime_parse",
                "arguments": {"input": "2024-06-15T14:30:00Z"}
            }
        }')

    if [[ "$response" == *"year"* ]] || [[ "$response" == *"2024"* ]]; then
        print_pass "DateTime parse tool works"
    else
        print_fail "DateTime parse tool failed: $response"
    fi

    # Test: Color Parse
    print_test "Call agent_tools_color_parse"
    response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 15,
            "method": "tools/call",
            "params": {
                "name": "agent_tools_color_parse",
                "arguments": {"color": "#ff0000"}
            }
        }')

    if [[ "$response" == *"rgb"* ]] || [[ "$response" == *"255"* ]]; then
        print_pass "Color parse tool works"
    else
        print_fail "Color parse tool failed: $response"
    fi

    # Test: Text Case
    print_test "Call agent_tools_text_case"
    response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 16,
            "method": "tools/call",
            "params": {
                "name": "agent_tools_text_case",
                "arguments": {"text": "hello world", "case": "upper"}
            }
        }')

    if [[ "$response" == *"HELLO"* ]]; then
        print_pass "Text case tool works"
    else
        print_fail "Text case tool failed: $response"
    fi

    # Test: Math Statistics
    print_test "Call agent_tools_math_statistics"
    response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 17,
            "method": "tools/call",
            "params": {
                "name": "agent_tools_math_statistics",
                "arguments": {"numbers": [1, 2, 3, 4, 5]}
            }
        }')

    if [[ "$response" == *"mean"* ]] || [[ "$response" == *"3"* ]]; then
        print_pass "Math statistics tool works"
    else
        print_fail "Math statistics tool failed: $response"
    fi
}

# ============================================================================
# MCP Error Handling Tests
# ============================================================================
test_mcp_errors() {
    print_header "MCP ERROR HANDLING TESTS"

    # Test: Invalid method
    print_test "Invalid method error"
    local response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 20,
            "method": "invalid/method",
            "params": {}
        }')

    if [[ "$response" == *"error"* ]]; then
        print_pass "Invalid method returns error"
    else
        print_fail "Invalid method should return error: $response"
    fi

    # Test: Invalid tool name
    print_test "Invalid tool name error"
    response=$(curl -s -X POST "$MCP_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 21,
            "method": "tools/call",
            "params": {
                "name": "nonexistent_tool",
                "arguments": {}
            }
        }')

    if [[ "$response" == *"error"* ]] || [[ "$response" == *"not found"* ]] || [[ "$response" == *"unknown"* ]]; then
        print_pass "Invalid tool returns error"
    else
        print_fail "Invalid tool should return error: $response"
    fi
}

# ============================================================================
# Main Test Runner
# ============================================================================
main() {
    print_header "AGENT TOOLS MCP SERVER TEST SUITE"

    # Wait for MCP server
    if ! wait_for_server "$MCP_URL" 10; then
        print_skip "MCP server not available at $MCP_URL (skipping MCP tests)"
        print_info "Start MCP server with: pnpm --filter @agent-tools/mcp-server dev"
        return 0
    fi

    # Run all MCP tests
    test_mcp_initialize
    test_mcp_tools_list
    test_mcp_tool_calls
    test_mcp_errors

    # Print summary
    print_summary
    exit $?
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
