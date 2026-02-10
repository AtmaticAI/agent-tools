#!/bin/bash
# A2A Agent Test Suite
# Tests A2A protocol endpoints

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/test-utils.sh"
source "$SCRIPT_DIR/../fixtures/test-data.sh"

# A2A server URL
A2A_URL="${A2A_URL:-http://localhost:$A2A_PORT}"

# ============================================================================
# A2A Agent Card Tests
# ============================================================================
test_a2a_agent_card() {
    print_header "A2A AGENT CARD TESTS"

    # Test: Get agent card
    print_test "GET /.well-known/agent.json"
    local response=$(curl -s "$A2A_URL/.well-known/agent.json")

    if [[ "$response" == *"name"* ]] && [[ "$response" == *"skills"* ]]; then
        print_pass "Agent card retrieved"
    else
        print_fail "Agent card failed: $response"
    fi

    # Verify agent card structure
    print_test "Agent card has required fields"
    if [[ "$response" == *"\"name\""* ]] && [[ "$response" == *"\"description\""* ]] && [[ "$response" == *"\"url\""* ]]; then
        print_pass "Agent card has required fields"
    else
        print_fail "Agent card missing required fields"
    fi

    # Verify skills are listed
    print_test "Agent card lists skills"
    local skill_count=0

    if [[ "$response" == *"json-operations"* ]]; then
        print_pass "JSON operations skill listed"
        skill_count=$((skill_count + 1))
    fi

    if [[ "$response" == *"crypto-operations"* ]]; then
        print_pass "Crypto operations skill listed"
        skill_count=$((skill_count + 1))
    fi

    if [[ "$response" == *"sql-operations"* ]]; then
        print_pass "SQL operations skill listed"
        skill_count=$((skill_count + 1))
    fi

    if [[ "$response" == *"csv-operations"* ]]; then
        print_pass "CSV operations skill listed"
        skill_count=$((skill_count + 1))
    fi

    if [[ "$response" == *"datetime-operations"* ]]; then
        print_pass "DateTime operations skill listed"
        skill_count=$((skill_count + 1))
    fi

    if [ $skill_count -eq 0 ]; then
        print_fail "No skills found in agent card"
    fi
}

# ============================================================================
# A2A Tasks Send Tests
# ============================================================================
test_a2a_tasks_send() {
    print_header "A2A TASKS SEND TESTS"

    # Test: Send JSON format task
    print_test "Send JSON format task"
    local response=$(curl -s -X POST "$A2A_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tasks/send",
            "params": {
                "id": "test-json-1",
                "message": {
                    "role": "user",
                    "parts": [{"type": "text", "text": "Format this JSON: {\"a\":1,\"b\":2}"}]
                }
            }
        }')

    if [[ "$response" == *"result"* ]] || [[ "$response" == *"content"* ]] || [[ "$response" == *"status"* ]]; then
        print_pass "JSON task sent successfully"
    else
        print_fail "JSON task failed: $response"
    fi

    # Test: Send crypto hash task
    print_test "Send crypto hash task"
    response=$(curl -s -X POST "$A2A_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 2,
            "method": "tasks/send",
            "params": {
                "id": "test-crypto-1",
                "message": {
                    "role": "user",
                    "parts": [{"type": "text", "text": "Hash this text with SHA256: hello world"}]
                }
            }
        }')

    if [[ "$response" == *"result"* ]] || [[ "$response" == *"hash"* ]] || [[ "$response" == *"status"* ]]; then
        print_pass "Crypto task sent successfully"
    else
        print_fail "Crypto task failed: $response"
    fi

    # Test: Send SQL format task
    print_test "Send SQL format task"
    response=$(curl -s -X POST "$A2A_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 3,
            "method": "tasks/send",
            "params": {
                "id": "test-sql-1",
                "message": {
                    "role": "user",
                    "parts": [{"type": "text", "text": "Format this SQL: SELECT * FROM users WHERE id=1"}]
                }
            }
        }')

    if [[ "$response" == *"result"* ]] || [[ "$response" == *"SELECT"* ]] || [[ "$response" == *"status"* ]]; then
        print_pass "SQL task sent successfully"
    else
        print_fail "SQL task failed: $response"
    fi
}

# ============================================================================
# A2A Tasks Get Tests
# ============================================================================
test_a2a_tasks_get() {
    print_header "A2A TASKS GET TESTS"

    # First send a task
    local send_response=$(curl -s -X POST "$A2A_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 10,
            "method": "tasks/send",
            "params": {
                "id": "test-get-1",
                "message": {
                    "role": "user",
                    "parts": [{"type": "text", "text": "Parse color: #ff0000"}]
                }
            }
        }')

    # Test: Get task status
    print_test "Get task status"
    local response=$(curl -s -X POST "$A2A_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 11,
            "method": "tasks/get",
            "params": {
                "id": "test-get-1"
            }
        }')

    if [[ "$response" == *"status"* ]] || [[ "$response" == *"result"* ]] || [[ "$response" == *"completed"* ]]; then
        print_pass "Task status retrieved"
    else
        print_fail "Task get failed: $response"
    fi
}

# ============================================================================
# A2A Skill-Specific Tests
# ============================================================================
test_a2a_skills() {
    print_header "A2A SKILL TESTS"

    # Test: DateTime skill
    print_test "DateTime skill"
    local response=$(curl -s -X POST "$A2A_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 20,
            "method": "tasks/send",
            "params": {
                "id": "test-datetime-1",
                "message": {
                    "role": "user",
                    "parts": [{"type": "text", "text": "Parse this datetime: 2024-06-15T14:30:00Z"}]
                }
            }
        }')

    if [[ "$response" == *"2024"* ]] || [[ "$response" == *"year"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "DateTime skill works"
    else
        print_fail "DateTime skill failed: $response"
    fi

    # Test: Regex skill
    print_test "Regex skill"
    response=$(curl -s -X POST "$A2A_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 21,
            "method": "tasks/send",
            "params": {
                "id": "test-regex-1",
                "message": {
                    "role": "user",
                    "parts": [{"type": "text", "text": "Test regex pattern \\\\d+ against abc123"}]
                }
            }
        }')

    if [[ "$response" == *"match"* ]] || [[ "$response" == *"123"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "Regex skill works"
    else
        print_fail "Regex skill failed: $response"
    fi

    # Test: Color skill
    print_test "Color skill"
    response=$(curl -s -X POST "$A2A_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 22,
            "method": "tasks/send",
            "params": {
                "id": "test-color-1",
                "message": {
                    "role": "user",
                    "parts": [{"type": "text", "text": "Parse color #3498db"}]
                }
            }
        }')

    if [[ "$response" == *"rgb"* ]] || [[ "$response" == *"hsl"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "Color skill works"
    else
        print_fail "Color skill failed: $response"
    fi
}

# ============================================================================
# A2A Error Handling Tests
# ============================================================================
test_a2a_errors() {
    print_header "A2A ERROR HANDLING TESTS"

    # Test: Invalid method
    print_test "Invalid method error"
    local response=$(curl -s -X POST "$A2A_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 30,
            "method": "invalid/method",
            "params": {}
        }')

    if [[ "$response" == *"error"* ]]; then
        print_pass "Invalid method returns error"
    else
        print_fail "Invalid method should return error: $response"
    fi

    # Test: Missing required params
    print_test "Missing params error"
    response=$(curl -s -X POST "$A2A_URL" \
        -H "Content-Type: application/json" \
        -d '{
            "jsonrpc": "2.0",
            "id": 31,
            "method": "tasks/send",
            "params": {}
        }')

    if [[ "$response" == *"error"* ]] || [[ "$response" == *"invalid"* ]]; then
        print_pass "Missing params returns error"
    else
        print_fail "Missing params should return error: $response"
    fi
}

# ============================================================================
# Main Test Runner
# ============================================================================
main() {
    print_header "AGENT TOOLS A2A AGENT TEST SUITE"

    # Wait for A2A server
    if ! wait_for_server "$A2A_URL/.well-known/agent.json" 10; then
        print_skip "A2A server not available at $A2A_URL (skipping A2A tests)"
        print_info "Start A2A server with: pnpm --filter @atmaticai/agent-tools-a2a dev"
        return 0
    fi

    # Run all A2A tests
    test_a2a_agent_card
    test_a2a_tasks_send
    test_a2a_tasks_get
    test_a2a_skills
    test_a2a_errors

    # Print summary
    print_summary
    exit $?
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
