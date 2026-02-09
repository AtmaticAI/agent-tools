import { allTools, type McpTool } from '@agent-tools/mcp-server';

const CATEGORIES: Record<string, string> = {
  json: 'JSON Studio',
  csv: 'CSV Viewer',
  pdf: 'PDF Toolkit',
  xml: 'XML Studio',
  excel: 'Excel Viewer',
  image: 'Image Toolkit',
  markdown: 'Markdown Studio',
  archive: 'Archive Manager',
  regex: 'Regex Tester',
  diff: 'Diff & Patch',
  sql: 'SQL Studio',
  crypto: 'Crypto & Encoding',
  datetime: 'Date/Time Tools',
  text: 'Text Utilities',
  math: 'Math Utilities',
  color: 'Color Utilities',
  physics: 'Physics Calculator',
  structural: 'Structural Engineering',
};

function getCategoryForTool(toolName: string): string {
  // Tool names follow: agent_tools_{category}_*
  const parts = toolName.replace(/^agent_tools_/, '').split('_');
  // Handle multi-word categories: try longest match first
  for (let len = parts.length; len >= 1; len--) {
    const candidate = parts.slice(0, len).join('_');
    // Normalise: crypto tools use 'crypto' prefix
    if (candidate in CATEGORIES) return candidate;
  }
  return parts[0];
}

export function buildSystemPrompt(enabledCategories: Record<string, boolean>, fileContext?: string): string {
  const enabledTools = allTools.filter((tool: McpTool) => {
    const cat = getCategoryForTool(tool.name);
    return enabledCategories[cat] !== false;
  });

  // Group by category
  const grouped: Record<string, McpTool[]> = {};
  for (const tool of enabledTools) {
    const cat = getCategoryForTool(tool.name);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(tool);
  }

  const toolDescriptions = Object.entries(grouped)
    .map(([cat, tools]) => {
      const header = CATEGORIES[cat] || cat;
      const lines = tools.map((t: McpTool) => {
        const params = Object.entries(t.inputSchema.properties || {})
          .map(([name, schema]) => {
            const s = schema as { type?: string; description?: string; enum?: string[] };
            const required = t.inputSchema.required?.includes(name);
            const enumVals = s.enum ? ` [${s.enum.join('|')}]` : '';
            return `${name} (${s.type || 'any'}${required ? ', required' : ''}${enumVals})`;
          })
          .join(', ');
        return `  - ${t.name}: ${t.description}\n    Parameters: {${params}}`;
      });
      return `### ${header}\n${lines.join('\n')}`;
    })
    .join('\n\n');

  return `You are the Agent Tools AI assistant by atmatic.ai.

## Your Role
You help users work with the Agent Tools platform — a collection of deterministic tools for data transformation. You can execute tools on behalf of users and explain how to use them.

## Scope
- ONLY respond about: atmatic.ai, Agent Tools platform, tool usage guidance, and executing tools
- When users ask you to perform a data operation (convert, format, parse, calculate, etc.), execute the appropriate tool
- When asked general knowledge questions, coding help, or anything outside the Agent Tools scope, politely decline and redirect them to use the tools

## Available Tools (${enabledTools.length} tools across ${Object.keys(grouped).length} categories)

${toolDescriptions}

## How to Execute Tools
When you need to execute a tool, output a JSON block in your response like this:
\`\`\`tool
{"tool": "tool_name", "arguments": {"param1": "value1"}}
\`\`\`

You can call multiple tools by including multiple tool blocks. After tools execute, you'll receive results and can explain them to the user.

## Guidelines
- Be concise and helpful
- When a user's request maps to a tool, execute it rather than just explaining
- Show tool results clearly
- If a tool fails, explain the error and suggest corrections
- If the user asks about something outside your scope, say: "I'm focused on helping you with Agent Tools. You can explore all tools at the homepage or visit atmatic.ai for more information."${
    fileContext
      ? `

## File Attachments
When the user attaches files, they appear as references like __file:0__, __file:1__, etc.
Use these references as the value for file parameters in tool calls.
Example: {"tool": "agent_tools_pdf_extract_text", "arguments": {"file": "__file:0__"}}
Do NOT attempt to generate or fabricate file content — always use the __file:N__ reference.

IMPORTANT for PDF forms: When asked to fill a PDF form, ALWAYS first call agent_tools_pdf_read_form to discover the exact field names, then use those exact names in agent_tools_pdf_fill_form. Never guess field names.

IMPORTANT: When a tool returns binary data (base64-encoded files like PDFs, images, archives), do NOT include the base64 data in your response. Simply tell the user the file was generated and they can download it using the download button. Never embed base64 strings or data URIs in your markdown.`
      : ''
  }`;
}
