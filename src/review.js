// Visual self-critique: render each slide in headless Chrome and flag issues the model
// can't see blind — overflow, empty/underfilled slides, text walls, broken images.
// This closes the generate -> look -> fix loop that a text-only LLM lacks.
import { withBrowser } from "./headless.js";

const STAGE_H = 720; // must match Reveal.initialize height in render.js
const TEXT_WALL = 620; // chars on one slide before it reads as a wall
const MIN_FILL = 3; // essentially no text (and no media) => genuinely empty slide
// (section/statement/big-number are intentionally sparse — not flagged)

export async function reviewDeck(fileUrl) {
  return withBrowser(async (browser) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: STAGE_H, deviceScaleFactor: 1 });
    await page.goto(fileUrl, { waitUntil: "networkidle0", timeout: 30000 });
    await page.waitForFunction("window.Reveal && Reveal.isReady && Reveal.isReady()", { timeout: 15000 });

    const total = await page.evaluate(() => Reveal.getTotalSlides());
    const issues = [];
    for (let i = 0; i < total; i++) {
      await page.evaluate((idx) => Reveal.slide(idx), i);
      await new Promise((r) => setTimeout(r, 220)); // let layout/animation settle
      const m = await page.evaluate((stageH) => {
        const s = Reveal.getCurrentSlide();
        if (!s) return null;
        const text = (s.innerText || "").trim();
        const media = s.querySelectorAll("img,video,svg,canvas,.chart,.bignum,.metric-v").length;
        const brokenImgs = [...s.querySelectorAll("img")].filter((im) => im.complete && im.naturalWidth === 0).length;
        return {
          layout: s.getAttribute("data-layout") || s.className || "?",
          scrollH: s.scrollHeight,
          overflow: s.scrollHeight - stageH,
          textLen: text.length,
          media,
          brokenImgs,
        };
      }, STAGE_H);
      if (!m) continue;
      const n = i + 1;
      if (m.overflow > 24) issues.push({ slide: n, kind: "overflow", msg: `слайд ${n}: контент вылезает на ${m.overflow}px — сократи текст/уменьши элементы` });
      if (m.textLen < MIN_FILL && m.media === 0) issues.push({ slide: n, kind: "empty", msg: `слайд ${n}: почти пустой (нет текста и медиа) — наполни или удали` });
      if (m.textLen > TEXT_WALL) issues.push({ slide: n, kind: "text-wall", msg: `слайд ${n}: простыня текста (${m.textLen} симв.) — разбей на буллеты/несколько слайдов` });
      if (m.brokenImgs > 0) issues.push({ slide: n, kind: "broken-image", msg: `слайд ${n}: битых картинок ${m.brokenImgs} — проверь URL/локальный путь` });
    }
    await page.close().catch(() => {});
    return { total, issues };
  });
}
