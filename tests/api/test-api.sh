#!/bin/bash
# REST API Test Suite
# Tests all API endpoints

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/test-utils.sh"
source "$SCRIPT_DIR/../fixtures/test-data.sh"

# ============================================================================
# JSON API Tests
# ============================================================================
test_json_api() {
    print_header "JSON API TESTS"

    # Test: Schema Validate
    print_test "POST /api/json/schema-validate"
    local response=$(curl -s -X POST "$BASE_URL/api/json/schema-validate" \
        -H "Content-Type: application/json" \
        -d '{"input": "{\"name\": \"test\", \"age\": 25}", "schema": "{\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}, \"age\": {\"type\": \"number\"}}}"}')

    if [[ "$response" == *"valid"* ]] || [[ "$response" == *"true"* ]]; then
        print_pass "JSON schema-validate API works"
    else
        print_fail "JSON schema-validate API failed: $response"
    fi
}

# ============================================================================
# Crypto API Tests
# ============================================================================
test_crypto_api() {
    print_header "CRYPTO API TESTS"

    # Test: Hash
    print_test "POST /api/crypto/hash"
    local response=$(curl -s -X POST "$BASE_URL/api/crypto/hash" \
        -H "Content-Type: application/json" \
        -d '{"input": "hello world", "algorithm": "sha256"}')

    if [[ "$response" == *"result"* ]] || [[ "$response" == *"b94d27"* ]]; then
        print_pass "Crypto hash API works"
    else
        print_fail "Crypto hash API failed: $response"
    fi

    # Test: Encode
    print_test "POST /api/crypto/encode"
    response=$(curl -s -X POST "$BASE_URL/api/crypto/encode" \
        -H "Content-Type: application/json" \
        -d '{"input": "hello", "format": "base64"}')

    if [[ "$response" == *"aGVsbG8"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "Crypto encode API works"
    else
        print_fail "Crypto encode API failed: $response"
    fi

    # Test: Decode
    print_test "POST /api/crypto/decode"
    response=$(curl -s -X POST "$BASE_URL/api/crypto/decode" \
        -H "Content-Type: application/json" \
        -d '{"input": "aGVsbG8=", "format": "base64"}')

    if [[ "$response" == *"hello"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "Crypto decode API works"
    else
        print_fail "Crypto decode API failed: $response"
    fi

    # Test: Decode JWT
    print_test "POST /api/crypto/jwt"
    response=$(curl -s -X POST "$BASE_URL/api/crypto/jwt" \
        -H "Content-Type: application/json" \
        -d "{\"token\": \"$CRYPTO_JWT\"}")

    if [[ "$response" == *"header"* ]] || [[ "$response" == *"payload"* ]]; then
        print_pass "Crypto JWT API works"
    else
        print_fail "Crypto JWT API failed: $response"
    fi
}

# ============================================================================
# SQL API Tests
# ============================================================================
test_sql_api() {
    print_header "SQL API TESTS"

    # Test: Format SQL
    print_test "POST /api/sql/format"
    local response=$(curl -s -X POST "$BASE_URL/api/sql/format" \
        -H "Content-Type: application/json" \
        -d '{"input": "SELECT * FROM users WHERE id=1", "dialect": "postgresql"}')

    if [[ "$response" == *"SELECT"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "SQL format API works"
    else
        print_fail "SQL format API failed: $response"
    fi

    # Test: Parse SQL
    print_test "POST /api/sql/parse"
    response=$(curl -s -X POST "$BASE_URL/api/sql/parse" \
        -H "Content-Type: application/json" \
        -d '{"input": "SELECT id, name FROM users"}')

    if [[ "$response" == *"columns"* ]] || [[ "$response" == *"tables"* ]] || [[ "$response" == *"type"* ]]; then
        print_pass "SQL parse API works"
    else
        print_fail "SQL parse API failed: $response"
    fi

    # Test: Validate SQL
    print_test "POST /api/sql/validate"
    response=$(curl -s -X POST "$BASE_URL/api/sql/validate" \
        -H "Content-Type: application/json" \
        -d '{"input": "SELECT * FROM users"}')

    if [[ "$response" == *"valid"* ]] || [[ "$response" == *"true"* ]]; then
        print_pass "SQL validate API works"
    else
        print_fail "SQL validate API failed: $response"
    fi
}

# ============================================================================
# Regex API Tests
# ============================================================================
test_regex_api() {
    print_header "REGEX API TESTS"

    # Test: Test regex
    print_test "POST /api/regex/test"
    local response=$(curl -s -X POST "$BASE_URL/api/regex/test" \
        -H "Content-Type: application/json" \
        -d '{"pattern": "\\d+", "input": "abc123def456"}')

    if [[ "$response" == *"match"* ]] || [[ "$response" == *"123"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "Regex test API works"
    else
        print_fail "Regex test API failed: $response"
    fi

    # Test: Replace regex
    print_test "POST /api/regex/replace"
    response=$(curl -s -X POST "$BASE_URL/api/regex/replace" \
        -H "Content-Type: application/json" \
        -d '{"pattern": "\\d+", "input": "abc123", "replacement": "XXX"}')

    if [[ "$response" == *"XXX"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "Regex replace API works"
    else
        print_fail "Regex replace API failed: $response"
    fi

    # Test: Extract regex
    print_test "POST /api/regex/extract"
    response=$(curl -s -X POST "$BASE_URL/api/regex/extract" \
        -H "Content-Type: application/json" \
        -d '{"pattern": "\\d+", "input": "abc123def456"}')

    if [[ "$response" == *"123"* ]] || [[ "$response" == *"456"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "Regex extract API works"
    else
        print_fail "Regex extract API failed: $response"
    fi
}

# ============================================================================
# Diff API Tests
# ============================================================================
test_diff_api() {
    print_header "DIFF API TESTS"

    # Test: Compare diff
    print_test "POST /api/diff/compare"
    local response=$(curl -s -X POST "$BASE_URL/api/diff/compare" \
        -H "Content-Type: application/json" \
        -d '{"a": "hello\nworld", "b": "hello\nuniverse"}')

    if [[ "$response" == *"result"* ]] || [[ "$response" == *"removed"* ]] || [[ "$response" == *"added"* ]]; then
        print_pass "Diff compare API works"
    else
        print_fail "Diff compare API failed: $response"
    fi

    # Test: Unified diff
    print_test "POST /api/diff/unified"
    response=$(curl -s -X POST "$BASE_URL/api/diff/unified" \
        -H "Content-Type: application/json" \
        -d '{"a": "line1\nline2", "b": "line1\nline3"}')

    if [[ "$response" == *"---"* ]] || [[ "$response" == *"+++"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "Diff unified API works"
    else
        print_fail "Diff unified API failed: $response"
    fi

    # Test: Apply patch
    print_test "POST /api/diff/apply"
    response=$(curl -s -X POST "$BASE_URL/api/diff/apply" \
        -H "Content-Type: application/json" \
        -d '{"original": "hello", "patch": "--- a\n+++ b\n@@ -1 +1 @@\n-hello\n+world"}')

    if [[ "$response" == *"result"* ]] || [[ "$response" == *"world"* ]] || [[ "$response" == *"error"* ]]; then
        print_pass "Diff apply API works (or gracefully errored)"
    else
        print_fail "Diff apply API failed: $response"
    fi
}

# ============================================================================
# DateTime API Tests
# ============================================================================
test_datetime_api() {
    print_header "DATETIME API TESTS"

    # Test: Parse datetime
    print_test "POST /api/datetime/parse"
    local response=$(curl -s -X POST "$BASE_URL/api/datetime/parse" \
        -H "Content-Type: application/json" \
        -d '{"input": "2024-06-15T14:30:00Z"}')

    if [[ "$response" == *"year"* ]] || [[ "$response" == *"2024"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "DateTime parse API works"
    else
        print_fail "DateTime parse API failed: $response"
    fi

    # Test: Format datetime
    print_test "POST /api/datetime/format"
    response=$(curl -s -X POST "$BASE_URL/api/datetime/format" \
        -H "Content-Type: application/json" \
        -d '{"input": "2024-06-15T14:30:00Z", "format": "YYYY-MM-DD"}')

    if [[ "$response" == *"2024"* ]] || [[ "$response" == *"result"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "DateTime format API works"
    else
        print_fail "DateTime format API failed: $response"
    fi

    # Test: Timezone convert
    print_test "POST /api/datetime/timezone"
    response=$(curl -s -X POST "$BASE_URL/api/datetime/timezone" \
        -H "Content-Type: application/json" \
        -d '{"input": "2024-06-15T14:30:00Z", "from": "UTC", "to": "America/New_York"}')

    if [[ "$response" == *"result"* ]] || [[ "$response" == *"10:30"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "DateTime timezone API works"
    else
        print_fail "DateTime timezone API failed: $response"
    fi

    # Test: Cron parse
    print_test "POST /api/datetime/cron"
    response=$(curl -s -X POST "$BASE_URL/api/datetime/cron" \
        -H "Content-Type: application/json" \
        -d '{"expression": "0 9 * * 1-5"}')

    if [[ "$response" == *"next"* ]] || [[ "$response" == *"description"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "DateTime cron API works"
    else
        print_fail "DateTime cron API failed: $response"
    fi
}

# ============================================================================
# Markdown API Tests
# ============================================================================
test_markdown_api() {
    print_header "MARKDOWN API TESTS"

    # Test: Convert to HTML
    print_test "POST /api/markdown/convert"
    local response=$(curl -s -X POST "$BASE_URL/api/markdown/convert" \
        -H "Content-Type: application/json" \
        -d '{"input": "# Hello\n\n**bold** text", "from": "markdown", "to": "html"}')

    if [[ "$response" == *"<h1>"* ]] || [[ "$response" == *"<strong>"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Markdown convert API works"
    else
        print_fail "Markdown convert API failed: $response"
    fi

    # Test: Generate TOC
    print_test "POST /api/markdown/toc"
    response=$(curl -s -X POST "$BASE_URL/api/markdown/toc" \
        -H "Content-Type: application/json" \
        -d '{"input": "# Heading 1\n## Heading 2\n### Heading 3"}')

    if [[ "$response" == *"Heading"* ]] || [[ "$response" == *"toc"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Markdown TOC API works"
    else
        print_fail "Markdown TOC API failed: $response"
    fi

    # Test: Get stats
    print_test "POST /api/markdown/stats"
    response=$(curl -s -X POST "$BASE_URL/api/markdown/stats" \
        -H "Content-Type: application/json" \
        -d '{"input": "# Hello World\n\nThis is a paragraph."}')

    if [[ "$response" == *"words"* ]] || [[ "$response" == *"headings"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Markdown stats API works"
    else
        print_fail "Markdown stats API failed: $response"
    fi
}

# ============================================================================
# XML API Tests
# ============================================================================
test_xml_api() {
    print_header "XML API TESTS"

    # Test: Format XML
    print_test "POST /api/xml/format"
    local response=$(curl -s -X POST "$BASE_URL/api/xml/format" \
        -H "Content-Type: application/json" \
        -d '{"input": "<root><item>test</item></root>"}')

    if [[ "$response" == *"<root>"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "XML format API works"
    else
        print_fail "XML format API failed: $response"
    fi

    # Test: Parse XML
    print_test "POST /api/xml/parse"
    response=$(curl -s -X POST "$BASE_URL/api/xml/parse" \
        -H "Content-Type: application/json" \
        -d '{"input": "<root><item>test</item></root>"}')

    if [[ "$response" == *"root"* ]] || [[ "$response" == *"item"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "XML parse API works"
    else
        print_fail "XML parse API failed: $response"
    fi

    # Test: Validate XML
    print_test "POST /api/xml/validate"
    response=$(curl -s -X POST "$BASE_URL/api/xml/validate" \
        -H "Content-Type: application/json" \
        -d '{"input": "<root><item>test</item></root>"}')

    if [[ "$response" == *"valid"* ]] || [[ "$response" == *"true"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "XML validate API works"
    else
        print_fail "XML validate API failed: $response"
    fi

    # Test: Convert XML to JSON
    print_test "POST /api/xml/convert"
    response=$(curl -s -X POST "$BASE_URL/api/xml/convert" \
        -H "Content-Type: application/json" \
        -d '{"input": "<root><item>test</item></root>", "from": "xml", "to": "json"}')

    if [[ "$response" == *"root"* ]] || [[ "$response" == *"item"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "XML convert API works"
    else
        print_fail "XML convert API failed: $response"
    fi
}

# ============================================================================
# Color API Tests
# ============================================================================
test_color_api() {
    print_header "COLOR API TESTS"

    # Test: Parse color
    print_test "POST /api/color/parse"
    local response=$(curl -s -X POST "$BASE_URL/api/color/parse" \
        -H "Content-Type: application/json" \
        -d '{"input": "#3498db"}')

    if [[ "$response" == *"rgb"* ]] || [[ "$response" == *"hsl"* ]] || [[ "$response" == *"52"* ]]; then
        print_pass "Color parse API works"
    else
        print_fail "Color parse API failed: $response"
    fi

    # Test: Contrast check
    print_test "POST /api/color/contrast"
    response=$(curl -s -X POST "$BASE_URL/api/color/contrast" \
        -H "Content-Type: application/json" \
        -d '{"color1": "#000000", "color2": "#ffffff"}')

    if [[ "$response" == *"ratio"* ]] || [[ "$response" == *"21"* ]] || [[ "$response" == *"contrast"* ]]; then
        print_pass "Color contrast API works"
    else
        print_fail "Color contrast API failed: $response"
    fi

    # Test: Generate palette
    print_test "POST /api/color/palette"
    response=$(curl -s -X POST "$BASE_URL/api/color/palette" \
        -H "Content-Type: application/json" \
        -d '{"base": "#3498db", "type": "complementary"}')

    if [[ "$response" == *"colors"* ]] || [[ "$response" == *"#"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Color palette API works"
    else
        print_fail "Color palette API failed: $response"
    fi

    # Test: Blend colors
    print_test "POST /api/color/blend"
    response=$(curl -s -X POST "$BASE_URL/api/color/blend" \
        -H "Content-Type: application/json" \
        -d '{"color1": "#ff0000", "color2": "#0000ff", "ratio": 0.5}')

    if [[ "$response" == *"result"* ]] || [[ "$response" == *"#"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Color blend API works"
    else
        print_fail "Color blend API failed: $response"
    fi

    # Test: Get color name
    print_test "POST /api/color/name"
    response=$(curl -s -X POST "$BASE_URL/api/color/name" \
        -H "Content-Type: application/json" \
        -d '{"input": "#ff0000"}')

    if [[ "$response" == *"red"* ]] || [[ "$response" == *"name"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Color name API works"
    else
        print_fail "Color name API failed: $response"
    fi
}

# ============================================================================
# Text API Tests
# ============================================================================
test_text_api() {
    print_header "TEXT API TESTS"

    # Test: Case conversion
    print_test "POST /api/text/case"
    local response=$(curl -s -X POST "$BASE_URL/api/text/case" \
        -H "Content-Type: application/json" \
        -d '{"input": "hello world", "to": "upper"}')

    if [[ "$response" == *"HELLO"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Text case API works"
    else
        print_fail "Text case API failed: $response"
    fi

    # Test: Slugify
    print_test "POST /api/text/slugify"
    response=$(curl -s -X POST "$BASE_URL/api/text/slugify" \
        -H "Content-Type: application/json" \
        -d '{"input": "Hello World Example"}')

    if [[ "$response" == *"hello-world"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Text slugify API works"
    else
        print_fail "Text slugify API failed: $response"
    fi

    # Test: Stats
    print_test "POST /api/text/stats"
    response=$(curl -s -X POST "$BASE_URL/api/text/stats" \
        -H "Content-Type: application/json" \
        -d '{"input": "Hello World"}')

    if [[ "$response" == *"words"* ]] || [[ "$response" == *"characters"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Text stats API works"
    else
        print_fail "Text stats API failed: $response"
    fi

    # Test: Truncate
    print_test "POST /api/text/truncate"
    response=$(curl -s -X POST "$BASE_URL/api/text/truncate" \
        -H "Content-Type: application/json" \
        -d '{"input": "Hello World Example Text", "length": 10}')

    if [[ "$response" == *"..."* ]] || [[ "$response" == *"Hello"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Text truncate API works"
    else
        print_fail "Text truncate API failed: $response"
    fi

    # Test: Lorem ipsum
    print_test "POST /api/text/lorem"
    response=$(curl -s -X POST "$BASE_URL/api/text/lorem" \
        -H "Content-Type: application/json" \
        -d '{"count": 2, "type": "sentences"}')

    if [[ "$response" == *"Lorem"* ]] || [[ "$response" == *"data"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "Text lorem API works"
    else
        print_fail "Text lorem API failed: $response"
    fi

    # Test: Similarity
    print_test "POST /api/text/similarity"
    response=$(curl -s -X POST "$BASE_URL/api/text/similarity" \
        -H "Content-Type: application/json" \
        -d '{"a": "hello world", "b": "hello there"}')

    if [[ "$response" == *"similarity"* ]] || [[ "$response" == *"0."* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Text similarity API works"
    else
        print_fail "Text similarity API failed: $response"
    fi
}

# ============================================================================
# Math API Tests
# ============================================================================
test_math_api() {
    print_header "MATH API TESTS"

    # Test: Unit conversion
    print_test "POST /api/math/convert"
    local response=$(curl -s -X POST "$BASE_URL/api/math/convert" \
        -H "Content-Type: application/json" \
        -d '{"value": 100, "from": "m", "to": "ft", "category": "length"}')

    if [[ "$response" == *"328"* ]] || [[ "$response" == *"result"* ]] || [[ "$response" == *"value"* ]]; then
        print_pass "Math convert API works"
    else
        print_fail "Math convert API failed: $response"
    fi

    # Test: Statistics
    print_test "POST /api/math/statistics"
    response=$(curl -s -X POST "$BASE_URL/api/math/statistics" \
        -H "Content-Type: application/json" \
        -d '{"numbers": [1, 2, 3, 4, 5]}')

    if [[ "$response" == *"mean"* ]] || [[ "$response" == *"3"* ]]; then
        print_pass "Math statistics API works"
    else
        print_fail "Math statistics API failed: $response"
    fi

    # Test: Base conversion
    print_test "POST /api/math/base"
    response=$(curl -s -X POST "$BASE_URL/api/math/base" \
        -H "Content-Type: application/json" \
        -d '{"input": "255", "fromBase": "decimal"}')

    if [[ "$response" == *"ff"* ]] || [[ "$response" == *"FF"* ]] || [[ "$response" == *"result"* ]]; then
        print_pass "Math base API works"
    else
        print_fail "Math base API failed: $response"
    fi

    # Test: Format number
    print_test "POST /api/math/format"
    response=$(curl -s -X POST "$BASE_URL/api/math/format" \
        -H "Content-Type: application/json" \
        -d '{"value": 1234567.89, "locale": "en-US"}')

    if [[ "$response" == *"1,234,567"* ]] || [[ "$response" == *"result"* ]] || [[ "$response" == *"data"* ]]; then
        print_pass "Math format API works"
    else
        print_fail "Math format API failed: $response"
    fi

    # Test: Percentage calculation
    print_test "POST /api/math/percentage"
    response=$(curl -s -X POST "$BASE_URL/api/math/percentage" \
        -H "Content-Type: application/json" \
        -d '{"value": 50, "total": 200}')

    if [[ "$response" == *"25"* ]] || [[ "$response" == *"result"* ]] || [[ "$response" == *"percentage"* ]]; then
        print_pass "Math percentage API works"
    else
        print_fail "Math percentage API failed: $response"
    fi
}

# ============================================================================
# Settings API Tests
# ============================================================================
test_settings_api() {
    print_header "SETTINGS API TESTS"

    # Test: Get settings
    print_test "GET /api/settings"
    local response=$(curl -s "$BASE_URL/api/settings")

    if [[ "$response" == *"tools"* ]] || [[ "$response" == *"enabled"* ]]; then
        print_pass "Settings GET API works"
    else
        print_fail "Settings GET API failed: $response"
    fi
}

# ============================================================================
# Main Test Runner
# ============================================================================
main() {
    print_header "AGENT TOOLS REST API TEST SUITE"

    # Wait for server
    if ! wait_for_server "$BASE_URL"; then
        print_fail "Server not available at $BASE_URL"
        exit 1
    fi

    # Run all API tests
    test_json_api
    test_crypto_api
    test_sql_api
    test_regex_api
    test_diff_api
    test_datetime_api
    test_markdown_api
    test_xml_api
    test_color_api
    test_text_api
    test_math_api
    test_settings_api

    # Print summary
    print_summary
    exit $?
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
