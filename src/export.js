// PDF export via reveal.js' built-in print-pdf view + headless Chrome page.pdf().
// No extra deps: reveal 5 bundles the print-view controller; we just drive it.
import { withBrowser } from "./headless.js";

export async function exportPdf(fileUrl, outPath) {
  return withBrowser(async (browser) => {
    const page = await browser.newPage();
    const url = fileUrl + (fileUrl.includes("?") ? "&" : "?") + "print-pdf";
    await page.goto(url, { waitUntil: "networkidle0", timeout: 40000 });
    await page.waitForFunction("window.Reveal && Reveal.isReady && Reveal.isReady()", { timeout: 15000 });
    await new Promise((r) => setTimeout(r, 600)); // let print layout settle
    await page.pdf({
      path: outPath,
      width: "1280px",
      height: "720px",
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    await page.close().catch(() => {});
    return outPath;
  });
}
