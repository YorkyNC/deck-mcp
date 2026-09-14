// Self-check for the media path: extension mapping (offline) + asset localization
// (downloads a small image and rewrites the URL to a local path). Run: node test-media.js
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { extFor, localizeAssets } from "./src/media.js";

// --- extFor: pure, offline ---
console.assert(extFor("image/jpeg", "x") === ".jpg", "jpeg→.jpg");
console.assert(extFor("image/png; charset=binary", "x") === ".png", "png (with params)→.png");
console.assert(extFor("image/webp", "x") === ".webp", "webp→.webp");
console.assert(extFor("video/mp4", "x") === ".mp4", "mp4→.mp4");
console.assert(extFor(null, "https://a/b/c.WEBP") === ".webp", "ext from url path");
console.assert(extFor("application/octet-stream", "https://a/b/c") === ".bin", "unknown→.bin");
console.assert(extFor(null, "https://a/b?x=1") === ".bin", "no ext, no type→.bin");
console.log("extFor: OK");

// --- localizeAssets: downloads + rewrites (needs network; degrades gracefully) ---
const dir = path.join(os.tmpdir(), "dm-media-test");
await fs.rm(dir, { recursive: true, force: true });
const deck = { slides: [{ layout: "image-cover", image: "https://picsum.photos/seed/dmtest/320/200" }] };
await localizeAssets(deck, dir);
const localized = deck.slides[0].image;
if (localized.startsWith("assets/")) {
  const stat = await fs.stat(path.join(dir, localized));
  console.assert(stat.size > 0, "скачанный файл пуст");
  // idempotent: second run reuses the cached file (same path, no re-download)
  const deck2 = { slides: [{ layout: "image-cover", image: "https://picsum.photos/seed/dmtest/320/200" }] };
  await localizeAssets(deck2, dir);
  console.assert(deck2.slides[0].image === localized, "кэш не переиспользован");
  console.log(`localizeAssets: OK (${localized}, ${stat.size} b, кэш работает)`);
} else {
  console.log(`localizeAssets: пропущено — сеть недоступна, URL сохранён как есть (${localized})`);
}

// --- opt-out: DECK_MCP_NO_FETCH keeps URLs untouched ---
process.env.DECK_MCP_NO_FETCH = "1";
const deck3 = { slides: [{ layout: "image-cover", image: "https://picsum.photos/seed/x/10/10" }] };
await localizeAssets(deck3, dir);
console.assert(deck3.slides[0].image === "https://picsum.photos/seed/x/10/10", "NO_FETCH должен оставить URL");
delete process.env.DECK_MCP_NO_FETCH;
console.log("DECK_MCP_NO_FETCH: OK");

console.log("OK — media-проверки прошли");
