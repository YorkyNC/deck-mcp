// Media localization: Pixabay forbids permanent hotlinking, so download external
// image/video URLs into <deckId>/assets/ and rewrite slide fields to local paths.
// Also makes decks self-contained + deployable. Opt out with DECK_MCP_NO_FETCH=1.
// Resilient: on any fetch failure the original URL is kept.
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const EXT_BY_TYPE = {
  "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png", "image/webp": ".webp",
  "image/gif": ".gif", "image/avif": ".avif", "video/mp4": ".mp4", "video/webm": ".webm",
};

export function extFor(contentType, url) {
  const ct = (contentType || "").split(";")[0].trim().toLowerCase();
  if (EXT_BY_TYPE[ct]) return EXT_BY_TYPE[ct];
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (/^\.[a-z0-9]{2,5}$/.test(ext)) return ext;
  } catch {}
  return ".bin";
}

export async function localizeAssets(deck, dir) {
  if (process.env.DECK_MCP_NO_FETCH) return;
  const assetsDir = path.join(dir, "assets");
  let existing = [];
  try { existing = await fs.readdir(assetsDir); } catch {}
  const cache = new Map();
  const grab = async (url) => {
    if (typeof url !== "string" || !/^https?:\/\//i.test(url)) return url;
    if (cache.has(url)) return cache.get(url);
    const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 16);
    const hit = existing.find((f) => f.startsWith(hash));
    if (hit) { const rel = `assets/${hit}`; cache.set(url, rel); return rel; }
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const name = hash + extFor(res.headers.get("content-type"), url);
      await fs.mkdir(assetsDir, { recursive: true });
      await fs.writeFile(path.join(assetsDir, name), buf);
      existing.push(name);
      const rel = `assets/${name}`; cache.set(url, rel); return rel;
    } catch {
      cache.set(url, url); return url; // keep original URL if download fails
    }
  };
  for (const s of deck.slides || []) {
    if (s.image) s.image = await grab(s.image);
    if (s.video) s.video = await grab(s.video);
    if (s.poster) s.poster = await grab(s.poster);
    if (Array.isArray(s.logos)) {
      const out = [];
      for (const l of s.logos) {
        if (typeof l === "string") out.push(await grab(l));
        else if (l && typeof l === "object" && l.src) out.push({ ...l, src: await grab(l.src) });
        else out.push(l);
      }
      s.logos = out;
    }
  }
}
