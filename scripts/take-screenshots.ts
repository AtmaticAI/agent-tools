import { chromium, type Browser, type Page } from "playwright";
import { spawn, type ChildProcess } from "child_process";
import path from "path";

const SCREENSHOTS_DIR = path.join(__dirname, "..", "screenshots");
const BASE_URL = "http://localhost:3000";
const VIEWPORT = { width: 1440, height: 900 };

interface Screenshot {
  name: string;
  path: string;
  setup?: (page: Page) => Promise<void>;
}

const screenshots: Screenshot[] = [
  {
    name: "homepage.png",
    path: "/",
  },
  {
    name: "json-studio.png",
    path: "/json",
    setup: async (page) => {
      // Add sample JSON data as single-line unformatted JSON
      const sampleJson = '{"name":"Agent Tools","version":"1.0.0","features":["JSON Studio","CSV Viewer","PDF Toolkit"],"config":{"enableMCP":true,"enableA2A":true,"transport":"stdio"}}';
      const textarea = page.locator("textarea").first();
      await textarea.fill(sampleJson);
      await page.waitForTimeout(300);
      // Click Format button to generate output
      const formatButton = page.getByRole("button", { name: "Format" });
      await formatButton.click();
      await page.waitForTimeout(500);
    },
  },
  {
    name: "csv-viewer.png",
    path: "/csv",
    setup: async (page) => {
      // Add sample CSV data
      const sampleCsv = `name,email,department,salary
John Smith,john@example.com,Engineering,85000
Jane Doe,jane@example.com,Marketing,72000
Bob Wilson,bob@example.com,Engineering,92000
Alice Brown,alice@example.com,Sales,68000
Charlie Davis,charlie@example.com,Engineering,78000`;
      const textarea = page.locator("textarea").first();
      await textarea.fill(sampleCsv);
      // Click parse button
      const parseButton = page.getByRole("button", { name: /parse/i });
      if (await parseButton.isVisible()) {
        await parseButton.click();
        await page.waitForTimeout(500);
      }
    },
  },
  {
    name: "pdf-toolkit.png",
    path: "/pdf",
  },
  {
    name: "pdf-to-template.png",
    path: "/pdf",
    setup: async (page) => {
      // Click the "To Template" tab
      const toTemplateTab = page.getByRole("tab", { name: /To Template/i });
      await toTemplateTab.click();
      await page.waitForTimeout(500);
    },
  },
  {
    name: "pdf-from-template.png",
    path: "/pdf",
    setup: async (page) => {
      // Click the "From Template" tab and fill in sample data
      const fromTemplateTab = page.getByRole("tab", { name: /From Template/i });
      await fromTemplateTab.click();
      await page.waitForTimeout(500);

      const sampleTemplate = JSON.stringify({
        name: "Invoice Template",
        pages: [{
          elements: [
            { type: "text", content: "Invoice #{{invoice_number}}", x: 50, y: 50, fontSize: 24 },
            { type: "text", content: "Date: {{date}}", x: 50, y: 90, fontSize: 12 },
            { type: "text", content: "Bill To: {{customer_name}}", x: 50, y: 130, fontSize: 14 },
            { type: "text", content: "Amount: ${{amount}}", x: 50, y: 170, fontSize: 14 },
          ]
        }]
      }, null, 2);

      const sampleData = JSON.stringify({
        invoice_number: "INV-2025-001",
        date: "2025-02-04",
        customer_name: "Acme Corp",
        amount: "1,500.00"
      }, null, 2);

      const textareas = page.locator("textarea");
      await textareas.nth(0).fill(sampleTemplate);
      await page.waitForTimeout(200);
      await textareas.nth(1).fill(sampleData);
      await page.waitForTimeout(300);
    },
  },
  {
    name: "connect.png",
    path: "/connect",
  },
];

async function waitForServer(
  url: string,
  maxAttempts = 30,
  interval = 1000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  return false;
}

async function startDevServer(): Promise<ChildProcess | null> {
  // Check if server is already running
  try {
    const response = await fetch(BASE_URL);
    if (response.ok) {
      console.log("Dev server already running");
      return null;
    }
  } catch {
    // Server not running, start it
  }

  console.log("Starting dev server...");
  const devServer = spawn("pnpm", ["dev:web"], {
    cwd: path.join(__dirname, ".."),
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });

  devServer.stdout?.on("data", (data) => {
    const output = data.toString();
    if (output.includes("Ready") || output.includes("localhost:3000")) {
      console.log("Server ready signal received");
    }
  });

  devServer.stderr?.on("data", (data) => {
    // Suppress stderr unless debugging
  });

  const isReady = await waitForServer(BASE_URL);
  if (!isReady) {
    throw new Error("Dev server failed to start");
  }

  console.log("Dev server started");
  return devServer;
}

async function takeScreenshots(): Promise<void> {
  let devServer: ChildProcess | null = null;
  let browser: Browser | null = null;

  try {
    devServer = await startDevServer();
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    for (const screenshot of screenshots) {
      console.log(`Taking screenshot: ${screenshot.name}`);
      await page.goto(`${BASE_URL}${screenshot.path}`, {
        waitUntil: "networkidle",
      });

      // Wait for any animations to complete
      await page.waitForTimeout(1000);

      // Run custom setup if provided
      if (screenshot.setup) {
        await screenshot.setup(page);
        await page.waitForTimeout(500);
      }

      // Take screenshot
      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, screenshot.name),
        fullPage: false,
      });

      console.log(`  Saved: ${screenshot.name}`);
    }

    console.log("\nAll screenshots captured successfully!");
  } finally {
    if (browser) {
      await browser.close();
    }
    if (devServer) {
      console.log("Stopping dev server...");
      process.kill(-devServer.pid!, "SIGTERM");
    }
  }
}

takeScreenshots().catch((error) => {
  console.error("Error taking screenshots:", error);
  process.exit(1);
});
