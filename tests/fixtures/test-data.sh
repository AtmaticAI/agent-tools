#!/bin/bash
# Test data fixtures for all test scenarios

# JSON test data
export JSON_VALID='{"name": "John Doe", "age": 30, "email": "john@example.com", "active": true, "tags": ["admin", "user"]}'
export JSON_NESTED='{"user": {"profile": {"name": "Jane", "settings": {"theme": "dark", "notifications": true}}}}'
export JSON_ARRAY='[{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}, {"id": 3, "name": "Item 3"}]'
export JSON_INVALID='{"name": "broken json'
export JSON_MINIFIED='{"a":1,"b":2,"c":{"d":3}}'

# CSV test data
export CSV_SIMPLE='name,email,age
John,john@example.com,30
Jane,jane@example.com,25
Bob,bob@example.com,35'

export CSV_WITH_QUOTES='name,description,price
"Widget A","A simple widget",19.99
"Widget B","A complex, multi-purpose widget",49.99'

# SQL test data
export SQL_SELECT='SELECT id, name, email FROM users WHERE status = '\''active'\'' ORDER BY created_at DESC LIMIT 10'
export SQL_INSERT='INSERT INTO users (name, email, age) VALUES ('\''John Doe'\'', '\''john@example.com'\'', 30)'
export SQL_COMPLEX='SELECT u.id, u.name, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.created_at > '\''2024-01-01'\'' GROUP BY u.id HAVING COUNT(o.id) > 5 ORDER BY order_count DESC'

# XML test data
export XML_SIMPLE='<?xml version="1.0"?><root><item id="1">Test Item</item><item id="2">Another Item</item></root>'
export XML_WITH_ATTRS='<?xml version="1.0" encoding="UTF-8"?><catalog><book isbn="123"><title>Test Book</title><author>John Doe</author></book></catalog>'

# Markdown test data
export MARKDOWN_SIMPLE='# Hello World

This is a **bold** and *italic* text.

## Features
- Item 1
- Item 2
- Item 3

```javascript
const hello = "world";
```'

# Regex test data
export REGEX_EMAIL_PATTERN='[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
export REGEX_TEST_TEXT='Contact us at hello@example.com or support@test.org for help. Invalid: not-an-email'
export REGEX_PHONE_PATTERN='\(\d{3}\)\s?\d{3}-\d{4}'
export REGEX_PHONE_TEXT='Call us at (555) 123-4567 or (800)555-1234'

# Diff test data
export DIFF_ORIGINAL='Hello World
This is line 2
This is line 3
Keep this line'

export DIFF_MODIFIED='Hello Universe
This is line 2
This is the new line 3
Keep this line
Added new line'

# DateTime test data
export DATETIME_ISO='2024-06-15T14:30:00Z'
export DATETIME_UNIX='1718458200'
export DATETIME_CRON='0 9 * * 1-5'

# Crypto test data
export CRYPTO_TEXT='Hello, World!'
export CRYPTO_JWT='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

# Color test data
export COLOR_HEX='#3498db'
export COLOR_RGB='rgb(52, 152, 219)'
export COLOR_HSL='hsl(204, 70%, 53%)'

# Text test data
export TEXT_CASE='hello world example text'
export TEXT_TEMPLATE='Hello {{name}}, welcome to {{place}}!'
export TEXT_TEMPLATE_DATA='{"name": "John", "place": "Agent Tools"}'

# Math test data
export MATH_NUMBERS='10, 20, 30, 40, 50'
export MATH_UNIT_VALUE='100'
export MATH_HEX='FF'
export MATH_BINARY='11111111'

# API test payloads
export API_JSON_FORMAT='{
  "json": "{\"a\":1,\"b\":2}",
  "indent": 2
}'

export API_JSON_QUERY='{
  "json": "{\"users\": [{\"name\": \"John\"}, {\"name\": \"Jane\"}]}",
  "path": "users[*].name"
}'

export API_CRYPTO_HASH='{
  "input": "hello world",
  "algorithm": "sha256"
}'

export API_SQL_FORMAT='{
  "sql": "SELECT * FROM users WHERE id=1",
  "dialect": "postgresql"
}'

# MCP test payloads
export MCP_INITIALIZE='{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {},
    "clientInfo": {"name": "test-client", "version": "1.0.0"}
  }
}'

export MCP_TOOLS_LIST='{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list",
  "params": {}
}'

export MCP_TOOL_CALL='{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "agent_tools_json_format",
    "arguments": {"json": "{\"a\":1}", "indent": 2}
  }
}'

# A2A test payloads
export A2A_AGENT_CARD_REQUEST='GET'

export A2A_TASK_SEND='{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tasks/send",
  "params": {
    "id": "test-task-1",
    "message": {
      "role": "user",
      "parts": [{"type": "text", "text": "Format this JSON: {\"a\":1}"}]
    }
  }
}'
