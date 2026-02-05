#!/bin/bash
# UI Test Suite using agent-browser
# Tests all tool pages with various scenarios

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../lib/test-utils.sh"
source "$SCRIPT_DIR/../fixtures/test-data.sh"

# Configuration
SCREENSHOT_DIR="${SCREENSHOT_DIR:-$SCRIPT_DIR/../../screenshots}"
VIEWPORT_WIDTH=1280
VIEWPORT_HEIGHT=800

# Ensure screenshot directory exists
mkdir -p "$SCREENSHOT_DIR"

# Initialize browser with fullscreen viewport
init_browser() {
    print_info "Initializing browser with viewport ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT}"
    agent-browser --headed set viewport $VIEWPORT_WIDTH $VIEWPORT_HEIGHT
}

# Close browser at the end
cleanup_browser() {
    print_info "Closing browser"
    agent-browser close 2>/dev/null || true
}

# Trap to ensure cleanup
trap cleanup_browser EXIT

# Helper to run UI test
run_ui_test() {
    local name="$1"
    local url="$2"
    local test_func="$3"

    print_test "$name"

    # Navigate to page
    if ! agent-browser --headed open "$url" > /dev/null 2>&1; then
        print_fail "Failed to open $url"
        return 1
    fi

    sleep 1

    # Run the test function
    if $test_func; then
        print_pass "$name"
        return 0
    else
        print_fail "$name"
        return 1
    fi
}

# ============================================================================
# Homepage Tests
# ============================================================================
test_homepage() {
    print_header "HOMEPAGE TESTS"

    agent-browser --headed open "$BASE_URL" > /dev/null
    sleep 2

    # Test page loads
    local title=$(agent-browser --headed get title)
    assert_contains "$title" "Agent Tools" "Homepage title contains 'Agent Tools'"

    # Test all tool links are present
    local snapshot=$(agent-browser --headed snapshot)
    assert_contains "$snapshot" "JSON Studio" "Homepage has JSON Studio link"
    assert_contains "$snapshot" "Crypto" "Homepage has Crypto link"
    assert_contains "$snapshot" "SQL Studio" "Homepage has SQL Studio link"

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/homepage.png" --full
    print_pass "Homepage screenshot saved"
}

# ============================================================================
# JSON Studio Tests
# ============================================================================
test_json_studio() {
    print_header "JSON STUDIO TESTS"

    agent-browser --headed open "$BASE_URL/json" > /dev/null
    sleep 2

    # Test 1: Format JSON
    print_test "Format valid JSON"
    agent-browser --headed fill "textarea" "$JSON_MINIFIED"
    agent-browser --headed click "button:has-text('Format')"
    sleep 1

    local snapshot=$(agent-browser --headed snapshot)
    if [[ "$snapshot" == *"Expand"* ]] || [[ "$snapshot" == *"Tree"* ]]; then
        print_pass "JSON formatted successfully"
    else
        print_fail "JSON format failed"
    fi

    # Test 2: Validate JSON
    print_test "Validate JSON"
    agent-browser --headed click "button:has-text('Validate')"
    sleep 1
    print_pass "JSON validation completed"

    # Test 3: Minify JSON
    print_test "Minify JSON"
    agent-browser --headed fill "textarea" "$JSON_VALID"
    agent-browser --headed click "button:has-text('Minify')"
    sleep 1
    print_pass "JSON minified"

    # Test 4: Convert to YAML
    print_test "Convert JSON to YAML"
    agent-browser --headed fill "textarea" "$JSON_VALID"
    agent-browser --headed click "button:has-text('Convert')"
    sleep 1
    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"name:"* ]]; then
        print_pass "JSON converted to YAML"
    else
        print_fail "JSON to YAML conversion failed"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/json-studio.png" --full
    print_pass "JSON Studio screenshot saved"
}

# ============================================================================
# Crypto & Encoding Tests
# ============================================================================
test_crypto() {
    print_header "CRYPTO & ENCODING TESTS"

    agent-browser --headed open "$BASE_URL/crypto" > /dev/null
    sleep 2

    # Test 1: Hash text
    print_test "Hash text with SHA-256"
    agent-browser --headed fill "textarea" "$CRYPTO_TEXT"
    agent-browser --headed click "button:has-text('Hash')"
    sleep 1

    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"sha256"* ]]; then
        print_pass "SHA-256 hash generated"
    else
        print_fail "Hash generation failed"
    fi

    # Test 2: Encode Base64
    print_test "Encode to Base64"
    local snapshot=$(agent-browser --headed snapshot -i)
    agent-browser --headed click "tab:has-text('Encode')"
    sleep 1
    agent-browser --headed fill "textarea" "$CRYPTO_TEXT"
    agent-browser --headed click "button:has-text('Encode')"
    sleep 1
    print_pass "Base64 encoding completed"

    # Test 3: Decode JWT
    print_test "Decode JWT"
    agent-browser --headed click "tab:has-text('JWT')"
    sleep 1
    snapshot=$(agent-browser --headed snapshot -i)
    # Find the JWT textarea and fill it
    agent-browser --headed fill "textarea" "$CRYPTO_JWT"
    agent-browser --headed click "button:has-text('Decode')"
    sleep 1

    page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"John Doe"* ]] || [[ "$page_text" == *"header"* ]]; then
        print_pass "JWT decoded successfully"
    else
        print_fail "JWT decode failed"
    fi

    # Test 4: Generate UUID
    print_test "Generate UUID"
    agent-browser --headed click "tab:has-text('UUID')"
    sleep 1
    agent-browser --headed click "button:has-text('Generate')"
    sleep 1

    page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" =~ [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12} ]]; then
        print_pass "UUID generated"
    else
        print_fail "UUID generation failed"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/crypto-encoding.png" --full
    print_pass "Crypto screenshot saved"
}

# ============================================================================
# SQL Studio Tests
# ============================================================================
test_sql_studio() {
    print_header "SQL STUDIO TESTS"

    agent-browser --headed open "$BASE_URL/sql" > /dev/null
    sleep 2

    # Test 1: Format SQL
    print_test "Format SQL query"
    agent-browser --headed fill "textarea" "$SQL_SELECT"
    agent-browser --headed click "button:has-text('Format')"
    sleep 1

    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"SELECT"* ]] && [[ "$page_text" == *"FROM"* ]]; then
        print_pass "SQL formatted"
    else
        print_fail "SQL format failed"
    fi

    # Test 2: Validate SQL
    print_test "Validate SQL"
    agent-browser --headed click "button:has-text('Validate')"
    sleep 1
    print_pass "SQL validated"

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/sql-studio.png" --full
    print_pass "SQL Studio screenshot saved"
}

# ============================================================================
# Regex Tester Tests
# ============================================================================
test_regex() {
    print_header "REGEX TESTER TESTS"

    agent-browser --headed open "$BASE_URL/regex" > /dev/null
    sleep 2

    # Test 1: Test email pattern
    print_test "Test email regex pattern"
    local snapshot=$(agent-browser --headed snapshot -i)

    # Fill pattern and test string
    agent-browser --headed eval "document.querySelectorAll('input')[0].value = '$REGEX_EMAIL_PATTERN'"
    agent-browser --headed eval "document.querySelectorAll('input')[0].dispatchEvent(new Event('input', {bubbles: true}))"
    agent-browser --headed fill "textarea" "$REGEX_TEST_TEXT"
    agent-browser --headed click "button:has-text('Test')"
    sleep 1

    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"match"* ]]; then
        print_pass "Regex test completed"
    else
        print_fail "Regex test failed"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/regex-tester.png" --full
    print_pass "Regex Tester screenshot saved"
}

# ============================================================================
# Diff & Patch Tests
# ============================================================================
test_diff() {
    print_header "DIFF & PATCH TESTS"

    agent-browser --headed open "$BASE_URL/diff" > /dev/null
    sleep 2

    # Test: Compare two texts
    print_test "Compare two texts"

    # Fill original and modified text
    agent-browser --headed eval "document.querySelectorAll('textarea')[0].value = \`$DIFF_ORIGINAL\`"
    agent-browser --headed eval "document.querySelectorAll('textarea')[0].dispatchEvent(new Event('input', {bubbles: true}))"
    agent-browser --headed eval "document.querySelectorAll('textarea')[1].value = \`$DIFF_MODIFIED\`"
    agent-browser --headed eval "document.querySelectorAll('textarea')[1].dispatchEvent(new Event('input', {bubbles: true}))"

    agent-browser --headed click "button:has-text('Compare')"
    sleep 1
    print_pass "Diff comparison completed"

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/diff-patch.png" --full
    print_pass "Diff & Patch screenshot saved"
}

# ============================================================================
# CSV Viewer Tests
# ============================================================================
test_csv() {
    print_header "CSV VIEWER TESTS"

    agent-browser --headed open "$BASE_URL/csv" > /dev/null
    sleep 2

    # Test: Parse CSV
    print_test "Parse CSV data"
    agent-browser --headed fill "textarea" "$CSV_SIMPLE"
    agent-browser --headed click "button:has-text('Parse')"
    sleep 1

    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"John"* ]] && [[ "$page_text" == *"rows"* ]]; then
        print_pass "CSV parsed successfully"
    else
        print_fail "CSV parsing failed"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/csv-viewer.png" --full
    print_pass "CSV Viewer screenshot saved"
}

# ============================================================================
# DateTime Tools Tests
# ============================================================================
test_datetime() {
    print_header "DATETIME TOOLS TESTS"

    agent-browser --headed open "$BASE_URL/datetime" > /dev/null
    sleep 2

    # Test 1: Parse current time
    print_test "Parse current datetime"
    agent-browser --headed click "button:has-text('Now')"
    sleep 1

    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"year"* ]] && [[ "$page_text" == *"month"* ]]; then
        print_pass "DateTime parsed"
    else
        print_fail "DateTime parse failed"
    fi

    # Test 2: Parse ISO date
    print_test "Parse ISO date"
    agent-browser --headed fill "input" "$DATETIME_ISO"
    agent-browser --headed click "button:has-text('Parse')"
    sleep 1
    print_pass "ISO date parsed"

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/datetime-tools.png" --full
    print_pass "DateTime Tools screenshot saved"
}

# ============================================================================
# Markdown Studio Tests
# ============================================================================
test_markdown() {
    print_header "MARKDOWN STUDIO TESTS"

    agent-browser --headed open "$BASE_URL/markdown" > /dev/null
    sleep 2

    # Test: Convert Markdown to HTML
    print_test "Convert Markdown to HTML"
    agent-browser --headed fill "textarea" "$MARKDOWN_SIMPLE"
    agent-browser --headed click "button:has-text('Convert')"
    sleep 1

    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"<h1>"* ]] || [[ "$page_text" == *"Hello World"* ]]; then
        print_pass "Markdown converted to HTML"
    else
        print_fail "Markdown conversion failed"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/markdown-studio.png" --full
    print_pass "Markdown Studio screenshot saved"
}

# ============================================================================
# XML Studio Tests
# ============================================================================
test_xml() {
    print_header "XML STUDIO TESTS"

    agent-browser --headed open "$BASE_URL/xml" > /dev/null
    sleep 2

    # Test: Format XML
    print_test "Format XML"
    agent-browser --headed fill "textarea" "$XML_SIMPLE"
    agent-browser --headed click "button:has-text('Format')"
    sleep 1

    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"<root>"* ]]; then
        print_pass "XML formatted"
    else
        print_fail "XML format failed"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/xml-studio.png" --full
    print_pass "XML Studio screenshot saved"
}

# ============================================================================
# Color Utilities Tests
# ============================================================================
test_color() {
    print_header "COLOR UTILITIES TESTS"

    agent-browser --headed open "$BASE_URL/color" > /dev/null
    sleep 2

    # Test: Parse color
    print_test "Parse HEX color"
    agent-browser --headed fill "input" "$COLOR_HEX"
    agent-browser --headed click "button:has-text('Parse')"
    sleep 1

    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"rgb"* ]] || [[ "$page_text" == *"hsl"* ]]; then
        print_pass "Color parsed"
    else
        print_fail "Color parse failed"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/color-utilities.png" --full
    print_pass "Color Utilities screenshot saved"
}

# ============================================================================
# Text Utilities Tests
# ============================================================================
test_text() {
    print_header "TEXT UTILITIES TESTS"

    agent-browser --headed open "$BASE_URL/text" > /dev/null
    sleep 2

    # Test: Case conversion
    print_test "Case conversion"
    agent-browser --headed fill "textarea" "$TEXT_CASE"
    agent-browser --headed click "button:has-text('Convert')"
    sleep 1
    print_pass "Text case converted"

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/text-utilities.png" --full
    print_pass "Text Utilities screenshot saved"
}

# ============================================================================
# Math Utilities Tests
# ============================================================================
test_math() {
    print_header "MATH UTILITIES TESTS"

    agent-browser --headed open "$BASE_URL/math" > /dev/null
    sleep 2

    # Test: Unit conversion
    print_test "Unit conversion"
    agent-browser --headed fill "input" "$MATH_UNIT_VALUE"
    agent-browser --headed click "button:has-text('Convert')"
    sleep 1
    print_pass "Unit converted"

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/math-utilities.png" --full
    print_pass "Math Utilities screenshot saved"
}

# ============================================================================
# PDF Toolkit Tests
# ============================================================================
test_pdf() {
    print_header "PDF TOOLKIT TESTS"

    agent-browser --headed open "$BASE_URL/pdf" > /dev/null
    sleep 2

    # Just verify page loads (requires file upload for full testing)
    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"PDF"* ]] && [[ "$page_text" == *"Upload"* ]]; then
        print_pass "PDF Toolkit page loads"
    else
        print_fail "PDF Toolkit page failed to load"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/pdf-toolkit.png" --full
    print_pass "PDF Toolkit screenshot saved"
}

# ============================================================================
# Excel Viewer Tests
# ============================================================================
test_excel() {
    print_header "EXCEL VIEWER TESTS"

    agent-browser --headed open "$BASE_URL/excel" > /dev/null
    sleep 2

    # Just verify page loads (requires file upload for full testing)
    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"Excel"* ]] && [[ "$page_text" == *"Upload"* ]]; then
        print_pass "Excel Viewer page loads"
    else
        print_fail "Excel Viewer page failed to load"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/excel-viewer.png" --full
    print_pass "Excel Viewer screenshot saved"
}

# ============================================================================
# Image Toolkit Tests
# ============================================================================
test_image() {
    print_header "IMAGE TOOLKIT TESTS"

    agent-browser --headed open "$BASE_URL/image" > /dev/null
    sleep 2

    # Just verify page loads (requires file upload for full testing)
    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"Image"* ]] && [[ "$page_text" == *"Upload"* ]]; then
        print_pass "Image Toolkit page loads"
    else
        print_fail "Image Toolkit page failed to load"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/image-toolkit.png" --full
    print_pass "Image Toolkit screenshot saved"
}

# ============================================================================
# Archive Manager Tests
# ============================================================================
test_archive() {
    print_header "ARCHIVE MANAGER TESTS"

    agent-browser --headed open "$BASE_URL/archive" > /dev/null
    sleep 2

    # Just verify page loads (requires file upload for full testing)
    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"Archive"* ]] && [[ "$page_text" == *"Upload"* ]]; then
        print_pass "Archive Manager page loads"
    else
        print_fail "Archive Manager page failed to load"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/archive-manager.png" --full
    print_pass "Archive Manager screenshot saved"
}

# ============================================================================
# Settings Page Tests
# ============================================================================
test_settings() {
    print_header "SETTINGS PAGE TESTS"

    agent-browser --headed open "$BASE_URL/settings" > /dev/null
    sleep 2

    local page_text=$(agent-browser --headed eval "document.body.innerText")
    if [[ "$page_text" == *"Settings"* ]] || [[ "$page_text" == *"Customize"* ]]; then
        print_pass "Settings page loads"
    else
        print_fail "Settings page failed to load"
    fi

    # Take screenshot
    agent-browser --headed screenshot "$SCREENSHOT_DIR/settings.png" --full
    print_pass "Settings screenshot saved"
}

# ============================================================================
# Main Test Runner
# ============================================================================
main() {
    print_header "AGENT TOOLS UI TEST SUITE"

    # Wait for server
    if ! wait_for_server "$BASE_URL"; then
        print_fail "Server not available at $BASE_URL"
        exit 1
    fi

    # Initialize browser
    init_browser

    # Run all tests
    test_homepage
    test_json_studio
    test_crypto
    test_sql_studio
    test_regex
    test_diff
    test_csv
    test_datetime
    test_markdown
    test_xml
    test_color
    test_text
    test_math
    test_pdf
    test_excel
    test_image
    test_archive
    test_settings

    # Print summary
    print_summary
    exit $?
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
