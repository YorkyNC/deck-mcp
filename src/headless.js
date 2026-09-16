// Headless Chrome via puppeteer-core + the system browser (no bundled Chromium download).
// Shared by review.js (visual self-critique) and export.js (PDF). Opt out: DECK_MCP_NO_BROWSER=1.
// Override the browser binary with DECK_MCP_CHROME.
import { existsSync } from "node:fs";

const CANDIDATES = [
  process.env.DECK_MCP_CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/microsoft-edge",
].filter(Boolean);

export function findChrome() {
  return CANDIDATES.find((p) => { try { return existsSync(p); } catch { return false; } }) || null;
}

// Run fn(browser); always closes. Throws a clear message if no browser / disabled.
export async function withBrowser(fn) {
  if (process.env.DECK_MCP_NO_BROWSER) throw new Error("headless отключён (DECK_MCP_NO_BROWSER)");
  const executablePath = findChrome();
  if (!executablePath) throw new Error("не найден Chrome/Chromium — задай DECK_MCP_CHROME=/путь/к/браузеру");
  const { default: puppeteer } = await import("puppeteer-core");
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--hide-scrollbars"],
  });
  try {
    return await fn(browser);
  } finally {
    await browser.close().catch(() => {});
  }
}
