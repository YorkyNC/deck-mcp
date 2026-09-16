// Brand extraction: fetch a company site and pull its accent color, fonts and logo so a
// deck can be tinted to the client's brand — the per-client wow a template gallery can't give.
// Regex-based (no HTML-parser dep); best-effort like media.js — never throws to the caller
// with garbage, returns what it found + sensible fallbacks.

const GOOGLE_FONT = /https:\/\/fonts\.googleapis\.com\/css2?\?[^"'\s]+/gi;
const HEX = /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi;

const abs = (base, u) => { try { return new URL(u, base).href; } catch { return null; } };

// perceived lightness 0..1 of a #hex
function lightness(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
// saturation-ish: distance between max and min channel (0 = gray)
function chroma(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
}
const norm = (hex) => {
  let h = hex.replace("#", "").toLowerCase();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return "#" + h;
};

// Pick the brand accent: prefer <meta theme-color> / brand CSS vars, else the most frequent
// vivid (non-gray, mid-lightness) color on the page.
function pickAccent(html) {
  const theme = html.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["'](#[0-9a-fA-F]{3,6})["']/i);
  if (theme) return norm(theme[1]);
  const brandVar = html.match(/--(?:brand|primary|accent|main)[\w-]*\s*:\s*(#[0-9a-fA-F]{3,6})/i);
  if (brandVar) return norm(brandVar[1]);
  const counts = new Map();
  for (const m of html.matchAll(HEX)) {
    const hex = norm(m[0]);
    const l = lightness(hex), c = chroma(hex);
    if (c < 0.15 || l < 0.12 || l > 0.9) continue; // skip grays, near-black, near-white
    counts.set(hex, (counts.get(hex) || 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return best ? best[0] : null;
}

function pickLogo(html, base) {
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og) return abs(base, og[1]);
  const apple = html.match(/<link[^>]+rel=["']apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i);
  if (apple) return abs(base, apple[1]);
  const img = html.match(/<img[^>]+(?:src|alt)=["'][^"']*logo[^"']*["'][^>]*>/i);
  if (img) { const src = img[0].match(/src=["']([^"']+)["']/i); if (src) return abs(base, src[1]); }
  const icon = html.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i);
  return icon ? abs(base, icon[1]) : null;
}

function pickFont(html) {
  const g = html.match(GOOGLE_FONT);
  if (g && g[0]) {
    const fam = g[0].match(/family=([^:&]+)/i);
    return { fontHref: g[0], font: fam ? decodeURIComponent(fam[1].replace(/\+/g, " ")) : null };
  }
  const face = html.match(/@font-face[^}]*font-family\s*:\s*["']?([^;"'}]+)/i);
  if (face) return { fontHref: null, font: face[1].trim() };
  return { fontHref: null, font: null };
}

// Recommend a base template from the page background lightness (dark site -> dark pack).
function recommendTemplate(html) {
  const bg = html.match(/(?:background(?:-color)?|--bg[\w-]*)\s*:\s*(#[0-9a-fA-F]{3,6})/i);
  if (bg && lightness(norm(bg[1])) < 0.4) return "aurora"; // dark
  if (bg) return "minimal"; // light
  return "aurora";
}

// Pure parse (no network) — testable in isolation.
export function parseBrand(html, base) {
  return {
    url: base,
    accent: pickAccent(html),
    logo: pickLogo(html, base),
    template: recommendTemplate(html),
    ...pickFont(html),
  };
}

export async function extractBrand(url) {
  const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  const res = await fetch(target, {
    signal: AbortSignal.timeout(15000),
    headers: { "user-agent": "Mozilla/5.0 (deck-mcp brand extractor)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  return parseBrand(html, res.url || target);
}
