// Deck JSON -> self-contained reveal.js HTML.
// One style pack for now: "aurora" (premium dark pitch). Add packs to PACKS below.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

// Bundle reveal.js into the HTML so a deck is fully self-contained: works offline and
// survives CDN outages — essential when the file is handed to a client. Falls back to
// the CDN only if the reveal.js package isn't installed.
const REVEAL = (() => {
  try {
    const require = createRequire(import.meta.url);
    const css = readFileSync(require.resolve("reveal.js/dist/reveal.css"), "utf8");
    const js = readFileSync(require.resolve("reveal.js/dist/reveal.js"), "utf8");
    return { head: `<style>${css}</style>`, script: `<script>${js}</script>` };
  } catch {
    return {
      head: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">`,
      script: `<script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>`,
    };
  }
})();

const esc = (s = "") =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Escape a URL for safe use inside a CSS url('...') / html attribute.
const escUrl = (s = "") => String(s).replace(/['"\\)]/g, "").replace(/\s/g, "%20");

// Background <video>: autoplay muted loop (reduced-motion is paused via MOTION_JS).
const videoTag = (src, poster, cls) =>
  `<video class="${cls}" autoplay muted loop playsinline preload="metadata"${poster ? ` poster="${escUrl(poster)}"` : ""}><source src="${escUrl(src)}" type="video/mp4"></video>`;

// --- inline SVG icon set (stroke = currentColor, no external deps) ----------
const ICONS = {
  rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 12a13 13 0 0 1 8-9c2 0 3 1 3 3a13 13 0 0 1-9 8l-2-2zM15 8.5a1 1 0 1 0 .01 0"/>',
  chart: '<path d="M3 3v18h18M8 15v-4M13 15V7M18 15v-8"/>',
  users: '<path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 20v-2a4 4 0 0 0-3-3.87M16 2.13A4 4 0 0 1 16 10"/>',
  check: '<path d="M20 6L9 17l-5-5"/>',
  star: '<path d="M12 2l3 7 7 .5-5.5 4.5 2 7L12 17l-6.5 4 2-7L2 9.5 9 9z"/>',
  bolt: '<path d="M13 2L3 14h8l-1 8 10-12h-8z"/>',
  shield: '<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  heart: '<path d="M12 21C6 16 3 12.5 3 8.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9 2.5C21 12.5 18 16 12 21z"/>',
  lock: '<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  trend: '<path d="M3 17l6-6 4 4 8-8M15 7h6v6"/>',
  money: '<circle cx="12" cy="12" r="9"/><path d="M15 9a3 3 0 0 0-3-2c-1.7 0-3 1-3 2.3 0 3.2 6 1.5 6 4.7C15 17.3 13.7 18 12 18a3 3 0 0 1-3-2M12 5v2M12 17v2"/>',
  layers: '<path d="M12 2l9 5-9 5-9-5zM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  cloud: '<path d="M6 18a4 4 0 0 1 0-8 5 5 0 0 1 9.5-1A4 4 0 0 1 18 18z"/>',
  code: '<path d="M8 6l-6 6 6 6M16 6l6 6-6 6"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
  flag: '<path d="M4 21V4M4 4h13l-2 4 2 4H4"/>',
};
const icon = (name) => {
  const p = ICONS[name];
  return p
    ? `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`
    : "";
};

// --- shared structural CSS (palette comes from per-pack :root vars) ---------
const BASE = `
.reveal{font-family:var(--font),system-ui,sans-serif;color:var(--fg);}
.reveal .slides{text-align:left;}
.reveal .slides section{padding:0 4%;}
body{background:var(--bg);}
.reveal h1,.reveal h2,.reveal h3{color:var(--fg);font-weight:800;letter-spacing:-.02em;text-transform:none;line-height:1.05;}
.reveal h1{font-size:2.4em;} .reveal h2{font-size:1.7em;}
.reveal .subtitle{color:var(--muted);font-size:1.1em;font-weight:500;margin-top:.4em;}
.reveal .kicker{color:var(--accent);font-weight:700;letter-spacing:.14em;text-transform:uppercase;font-size:.5em;margin-bottom:1.2em;}
.reveal ul{list-style:none;margin:.6em 0 0;}
.reveal ul li{margin:.55em 0;padding-left:1.4em;position:relative;font-size:.92em;}
.reveal ul li::before{content:"";position:absolute;left:0;top:.55em;width:.5em;height:.5em;border-radius:2px;background:var(--accent);}
.reveal .cols{display:grid;grid-template-columns:1fr 1fr;gap:2.2em;margin-top:.4em;}
.reveal .col-h{color:var(--accent);font-weight:700;font-size:.7em;letter-spacing:.06em;margin-bottom:.3em;}
.reveal .bignum{font-size:5.5em;font-weight:800;line-height:1;background:linear-gradient(120deg,var(--fg),var(--accent));-webkit-background-clip:text;background-clip:text;color:transparent;}
.reveal .bigcap{color:var(--muted);font-size:1.1em;margin-top:.2em;max-width:16ch;}
.reveal blockquote{border:0;box-shadow:none;background:none;font-size:1.5em;font-weight:600;line-height:1.3;}
.reveal blockquote .q-mark{color:var(--accent);font-size:1.4em;line-height:0;vertical-align:-.15em;margin-right:.1em;}
.reveal .q-author{color:var(--muted);font-size:.55em;font-weight:500;margin-top:.8em;}
.reveal .cta{display:inline-block;margin-top:1em;padding:.55em 1.3em;border-radius:999px;background:var(--accent);color:var(--on-accent);font-weight:700;font-size:.7em;}
.reveal .progress{color:var(--accent);}
.reveal .footer{position:fixed;bottom:1.1em;left:4%;color:var(--muted);font-size:.5em;letter-spacing:.04em;}
.reveal .ic{width:1em;height:1em;vertical-align:-.12em;}
/* cards */
.reveal .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(6.5em,1fr));gap:.9em;margin-top:.7em;}
.reveal .card{padding:.9em 1em;border-radius:.7em;background:color-mix(in srgb,var(--fg) 5%,transparent);border:1px solid color-mix(in srgb,var(--fg) 12%,transparent);}
.reveal .card-ic{color:var(--accent);font-size:1.6em;line-height:1;margin-bottom:.35em;}
.reveal .card-t{font-weight:700;font-size:.82em;margin-bottom:.25em;}
.reveal .card-x{color:var(--muted);font-size:.62em;line-height:1.35;}
/* metrics row */
.reveal .metrics{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:1.4em;margin-top:.8em;}
.reveal .metric-v{font-size:2.6em;font-weight:800;line-height:1;background:linear-gradient(120deg,var(--fg),var(--accent));-webkit-background-clip:text;background-clip:text;color:transparent;}
.reveal .metric-l{color:var(--muted);font-size:.62em;margin-top:.4em;max-width:14ch;}
/* section divider */
.reveal .section-title{font-size:3.2em;}
.reveal .section-title::after{content:"";display:block;width:2.2em;height:.14em;border-radius:2px;background:var(--accent);margin-top:.35em;}
/* image layouts (layered: bg image + accent tint + legibility overlay + content) */
.reveal .split{display:grid;grid-template-columns:1fr 1fr;gap:2em;align-items:center;min-height:460px;}
.reveal .img-side{position:relative;overflow:hidden;border-radius:1em;min-height:460px;background-color:color-mix(in srgb,var(--accent) 30%,var(--bg));}
.reveal .img-inner{position:absolute;inset:0;background-size:cover;background-position:center;}
.reveal .img-tint{position:absolute;inset:0;background:var(--accent);mix-blend-mode:multiply;opacity:0;}
.reveal .img-side.duotone .img-inner{filter:grayscale(1) contrast(1.05);}
.reveal .img-side.duotone .img-tint{opacity:.5;}
.reveal .cover{position:relative;overflow:hidden;display:flex;align-items:flex-end;min-height:560px;padding:2em;border-radius:1em;background-color:color-mix(in srgb,var(--accent) 30%,var(--bg));}
.reveal .cover-img{position:absolute;inset:0;z-index:0;background-size:cover;background-position:center;}
.reveal .cover-tint{position:absolute;inset:0;z-index:1;background:var(--accent);mix-blend-mode:multiply;opacity:0;}
.reveal .cover::after{content:"";position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(11,12,20,.15),rgba(11,12,20,.82));}
.reveal .cover.duotone .cover-img{filter:grayscale(1) contrast(1.05);}
.reveal .cover.duotone .cover-tint{opacity:.5;}
.reveal .cover-inner{position:relative;z-index:3;max-width:22ch;}
.reveal .cover-inner h1{color:#fff;}
.reveal .cover-inner .subtitle{color:rgba(255,255,255,.82);}
/* gradient mesh: soft colored blobs behind content — light alternative to hero, any theme */
.reveal .mesh .mesh-bg{position:absolute;inset:0;z-index:0;overflow:hidden;background:
  radial-gradient(40% 50% at 20% 20%, color-mix(in srgb,var(--accent) 28%,transparent), transparent 60%),
  radial-gradient(45% 55% at 85% 30%, color-mix(in srgb,var(--accent) 20%,transparent), transparent 60%),
  radial-gradient(55% 60% at 60% 95%, color-mix(in srgb,var(--accent) 16%,transparent), transparent 60%);}
.reveal .mesh>*:not(.mesh-bg){position:relative;z-index:1;}
/* video backgrounds (image-cover uses video.cover-img; other slides use .bg-video) */
.reveal video.cover-img{object-fit:cover;width:100%;height:100%;}
.reveal .has-video{--fg:#fff;--muted:rgba(255,255,255,.82);}
.reveal .bg-video{position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;}
.reveal .has-video::after{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(8,10,18,.35),rgba(8,10,18,.78));}
.reveal .has-video>*:not(.bg-video){position:relative;z-index:2;}
/* hero: dark animated background on any slide, any theme */
.reveal .hero{--fg:#ffffff;--muted:rgba(255,255,255,.78);}
.reveal .hero .hero-bg{position:absolute;inset:0;z-index:0;overflow:hidden;background:radial-gradient(70% 60% at 50% -10%,color-mix(in srgb,var(--accent) 22%,transparent),transparent 60%),#080a12;}
.reveal .hero .hero-bg::after{content:"";position:absolute;inset:0;background:radial-gradient(120% 100% at 50% 40%,transparent 40%,rgba(0,0,0,.68));}
.reveal .hero>*:not(.hero-bg){position:relative;z-index:1;}
/* charts */
.reveal .chart{width:100%;max-height:400px;margin-top:.4em;}
.reveal .chart .c-val{fill:var(--fg);font-weight:700;font-size:20px;font-family:var(--font),sans-serif;}
.reveal .chart .c-lab{fill:var(--muted);font-size:16px;font-family:var(--font),sans-serif;}
.reveal .donut-wrap{display:flex;align-items:center;gap:2em;margin-top:.4em;}
.reveal .chart-donut{width:auto;height:380px;flex:0 0 auto;}
.reveal .legend{list-style:none;margin:0;font-size:.7em;}
.reveal .legend li{margin:.4em 0;padding:0;}
.reveal .legend li::before{content:none;}
.reveal .legend .dot{display:inline-block;width:.8em;height:.8em;border-radius:3px;background:var(--accent);margin-right:.5em;vertical-align:-.05em;}
/* progress rings (chartType:"progress") */
.reveal .rings{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:1.6em;margin-top:.8em;justify-items:center;}
.reveal .ring{text-align:center;}
.reveal .ring-svg{width:auto;height:190px;}
.reveal .ring-num{fill:var(--fg);font-weight:800;font-size:30px;font-family:var(--font),sans-serif;}
.reveal .ring-lab{color:var(--muted);font-size:.62em;margin-top:.4em;max-width:14ch;}
/* timeline / roadmap */
.reveal .timeline{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:1.4em;margin-top:1.6em;position:relative;}
.reveal .timeline::before{content:"";position:absolute;top:.4em;left:.4em;right:.4em;height:2px;background:color-mix(in srgb,var(--fg) 16%,transparent);}
.reveal .tl-item{position:relative;padding-top:1.5em;}
.reveal .tl-dot{position:absolute;top:0;left:0;width:.9em;height:.9em;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px var(--bg);}
.reveal .tl-date{color:var(--accent);font-weight:700;font-size:.62em;letter-spacing:.04em;margin-bottom:.2em;}
.reveal .tl-t{font-weight:700;font-size:.82em;margin-bottom:.2em;}
.reveal .tl-x{color:var(--muted);font-size:.62em;line-height:1.35;}
/* process steps */
.reveal .steps{display:flex;align-items:flex-start;gap:1em;margin-top:1.4em;}
.reveal .step{flex:1;text-align:center;}
.reveal .step-n{width:2em;height:2em;line-height:2em;margin:0 auto .55em;border-radius:50%;background:var(--accent);color:var(--on-accent);font-weight:800;font-size:.95em;}
.reveal .step-t{font-weight:700;font-size:.8em;margin-bottom:.2em;}
.reveal .step-x{color:var(--muted);font-size:.6em;line-height:1.35;}
.reveal .step-arrow{color:var(--accent);font-size:1.4em;font-weight:700;flex:0 0 auto;align-self:center;}
/* pricing */
.reveal .prices{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:1.2em;margin-top:1.2em;align-items:stretch;}
.reveal .price{position:relative;display:flex;flex-direction:column;padding:1.3em 1.1em;border-radius:.9em;background:color-mix(in srgb,var(--fg) 5%,transparent);border:1px solid color-mix(in srgb,var(--fg) 12%,transparent);}
.reveal .price.popular{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent),0 14px 44px color-mix(in srgb,var(--accent) 22%,transparent);transform:scale(1.03);}
.reveal .price-badge{position:absolute;top:-.8em;left:50%;transform:translateX(-50%);background:var(--accent);color:var(--on-accent);font-weight:700;font-size:.5em;letter-spacing:.08em;text-transform:uppercase;padding:.4em 1em;border-radius:999px;white-space:nowrap;}
.reveal .price-name{color:var(--accent);font-weight:700;font-size:.7em;letter-spacing:.06em;text-transform:uppercase;margin-bottom:.35em;}
.reveal .price-v{font-size:2.4em;font-weight:800;line-height:1;}
.reveal .price-p{color:var(--muted);font-size:.6em;margin-top:.2em;}
.reveal .price ul{margin:.8em 0 0;flex:1;}
.reveal .price li{font-size:.66em;margin:.42em 0;}
.reveal .price .cta{margin-top:1em;text-align:center;}
/* logo wall */
.reveal .logos{display:grid;grid-template-columns:repeat(auto-fit,minmax(7em,1fr));gap:1.6em;align-items:center;margin-top:1.4em;}
.reveal .logo{display:flex;align-items:center;justify-content:center;padding:.6em;}
.reveal .logo img{max-width:100%;max-height:3.4em;object-fit:contain;filter:grayscale(1);opacity:.72;transition:filter .3s,opacity .3s;}
.reveal .logo:hover img{filter:none;opacity:1;}
.reveal .logo-txt{color:var(--muted);font-weight:700;font-size:.95em;letter-spacing:.02em;}
/* statement (kinetic thesis) */
.reveal .statement{font-size:2.8em;font-weight:800;line-height:1.15;letter-spacing:-.02em;max-width:20ch;background:linear-gradient(120deg,var(--fg),var(--accent));-webkit-background-clip:text;background-clip:text;color:transparent;}
`;

// --- style packs: palette + font only; structure lives in BASE -------------
export const PACKS = {
  aurora: {
    name: "Aurora",
    description: "Тёмный премиум-питч: крупная типографика, мягкое свечение, акцентный градиент.",
    defaultAccent: "#7c5cff",
    font: "Manrope",
    fontHref: "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap",
    vars: (accent) => `:root{--accent:${accent};--bg:#0b0c14;--fg:#f4f5fb;--muted:#9aa0b4;--font:'Manrope';--on-accent:#0b0c14;}`,
    extra: `
body{background:
  radial-gradient(60vw 60vw at 15% 0%, color-mix(in srgb,var(--accent) 32%, transparent), transparent 60%),
  radial-gradient(50vw 50vw at 100% 100%, color-mix(in srgb,var(--accent) 22%, transparent), transparent 55%),
  var(--bg);}
.reveal{position:relative;z-index:1;}
body::after{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(120vw 90vh at 50% 40%, transparent 42%, rgba(0,0,0,.58) 100%);}
@media (prefers-reduced-motion: no-preference){
body::before{content:"";position:fixed;inset:-25%;z-index:0;pointer-events:none;
  background:
    radial-gradient(34vw 34vw at 28% 32%, color-mix(in srgb,var(--accent) 36%, transparent), transparent 60%),
    radial-gradient(30vw 30vw at 74% 68%, color-mix(in srgb,var(--accent) 24%, transparent), transparent 60%);
  filter:blur(46px);animation:auroraFloat 18s ease-in-out infinite alternate;}
@keyframes auroraFloat{from{transform:translate(-3vw,-2vh) scale(1)}to{transform:translate(10vw,8vh) scale(1.16)}}
}`,
  },
  noir: {
    name: "Noir",
    description: "Глубокий чёрный: холодный акцент, живое свечение, сильное затемнение — максимум премиум-драмы.",
    defaultAccent: "#4f7cff",
    font: "Manrope",
    fontHref: "https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap",
    vars: (accent) => `:root{--accent:${accent};--bg:#05060a;--fg:#f2f4fb;--muted:#8b93a7;--font:'Manrope';--on-accent:#05060a;}`,
    extra: `
body{background:radial-gradient(70vw 60vw at 50% -10%, color-mix(in srgb,var(--accent) 20%, transparent), transparent 60%), var(--bg);}
.reveal{position:relative;z-index:1;}
body::after{content:"";position:fixed;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(120vw 90vh at 50% 38%, transparent 36%, rgba(0,0,0,.72) 100%);}
@media (prefers-reduced-motion: no-preference){
body::before{content:"";position:fixed;inset:-25%;z-index:0;pointer-events:none;
  background:
    radial-gradient(32vw 32vw at 26% 30%, color-mix(in srgb,var(--accent) 30%, transparent), transparent 60%),
    radial-gradient(28vw 28vw at 76% 70%, color-mix(in srgb,var(--accent) 18%, transparent), transparent 60%);
  filter:blur(50px);animation:auroraFloat 20s ease-in-out infinite alternate;}
@keyframes auroraFloat{from{transform:translate(-3vw,-2vh) scale(1)}to{transform:translate(9vw,7vh) scale(1.18)}}
}`,
  },
  minimal: {
    name: "Minimal",
    description: "Светлый корпоративный: чистый белый фон, строгая типографика Inter, мягкие тени.",
    defaultAccent: "#2563eb",
    font: "Inter",
    fontHref: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
    vars: (accent) => `:root{--accent:${accent};--bg:#ffffff;--fg:#0f1222;--muted:#5b6172;--font:'Inter';--on-accent:#ffffff;}`,
    extra: `
.reveal h1,.reveal h2,.reveal h3{font-weight:700;letter-spacing:-.01em;}
.reveal .card{background:#fff;border-color:color-mix(in srgb,var(--fg) 10%,transparent);box-shadow:0 6px 24px rgba(15,18,34,.06);}
.reveal .metric-v,.reveal .bignum{background:none;-webkit-background-clip:border-box;background-clip:border-box;color:var(--accent);}`,
  },
  editorial: {
    name: "Editorial",
    description: "Журнальный стиль: крупные серифные заголовки Fraunces, тёплый кремовый фон.",
    defaultAccent: "#e0483d",
    font: "Fraunces",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap",
    vars: (accent) => `:root{--accent:${accent};--bg:#f7f4ee;--fg:#1a1714;--muted:#6b6459;--font:'Inter';--on-accent:#ffffff;}`,
    extra: `
.reveal h1,.reveal h2,.reveal h3,.reveal .section-title{font-family:'Fraunces',Georgia,serif;font-weight:700;letter-spacing:-.01em;}
.reveal h1{font-size:2.9em;} .reveal .section-title{font-size:3.8em;}
.reveal .card{background:#fffdf9;border-color:color-mix(in srgb,var(--fg) 12%,transparent);}
.reveal .metric-v,.reveal .bignum{background:none;-webkit-background-clip:border-box;background-clip:border-box;color:var(--accent);}`,
  },
};

// --- motion: cascade entrance + count-up + chart draw (on by default) ------
// Everything triggers on slide-enter via reveal's `.present` class. No JS libs.
const stag = (sel, n, base, step) =>
  Array.from({ length: n }, (_, i) =>
    `.reveal.motion .present ${sel}:nth-of-type(${i + 1}){animation-delay:${(base + i * step).toFixed(2)}s}`
  ).join("");

const MOTION_CSS = `
@media (prefers-reduced-motion: no-preference){
@keyframes deckRise{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
@keyframes deckFade{from{opacity:0}to{opacity:1}}
@keyframes deckGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes deckDraw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
@keyframes deckSweep{from{stroke-dasharray:0 3000}}
.reveal.motion .present :is(h1,h2,h3,.kicker,.subtitle,.section-title,.bignum,.bigcap,blockquote,.cta,.col-h,.img-side,.cover-inner){animation:deckRise .55s cubic-bezier(.2,.7,.2,1) both;}
.reveal.motion .present>*:nth-child(2){animation-delay:.09s}
.reveal.motion .present>*:nth-child(3){animation-delay:.18s}
.reveal.motion .present>*:nth-child(4){animation-delay:.27s}
.reveal.motion .present>*:nth-child(5){animation-delay:.36s}
.reveal.motion .present :is(li,.card,.metric,.tl-item,.step,.price,.logo){animation:deckRise .5s cubic-bezier(.2,.7,.2,1) both;}
${stag("li", 8, 0.15, 0.07)}
${stag(".card", 8, 0.15, 0.1)}
${stag(".metric", 6, 0.15, 0.12)}
${stag(".tl-item", 8, 0.15, 0.1)}
${stag(".step", 6, 0.15, 0.12)}
${stag(".price", 5, 0.15, 0.12)}
${stag(".logo", 12, 0.05, 0.05)}
@keyframes deckWipe{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.reveal.motion .present .statement{animation:deckRise .6s cubic-bezier(.2,.7,.2,1) both,deckWipe 1s cubic-bezier(.2,.7,.2,1) both;}
@keyframes deckRing{from{stroke-dasharray:0 999}}
.reveal.motion .present .ring-val{animation:deckRing 1s cubic-bezier(.2,.7,.2,1) both;}
.reveal.motion .present .chart polygon{animation:deckFade .9s .25s both;}
.reveal.motion .present .chart rect{transform-box:fill-box;transform-origin:bottom;animation:deckGrow .7s cubic-bezier(.2,.7,.2,1) both;}
${stag(".chart rect", 8, 0.1, 0.08)}
.reveal.motion .present .chart text{animation:deckFade .6s .55s both;}
.reveal.motion .present .chart polyline{stroke-dasharray:1;animation:deckDraw 1.1s ease both;}
.reveal.motion .present .chart circle{animation:deckFade .5s .85s both;}
.reveal.motion .present .chart .seg{animation:deckSweep .9s ease both;animation-delay:calc(var(--si,0)*.14s);}
.reveal.motion .present .legend li{animation:deckFade .5s both;}
@keyframes deckKenburns{from{transform:scale(1) translate(0,0)}to{transform:scale(1.12) translate(-2.5%,-2%)}}
.reveal.motion .present .cover .cover-img{animation:deckKenburns 14s ease-out both;}
.reveal.motion .present .img-side.kb .img-inner{animation:deckKenburns 14s ease-out both;}
@keyframes deckMeshFloat{from{transform:scale(1) translate(0,0)}to{transform:scale(1.12) translate(2%,-2%)}}
.reveal.motion .present .mesh .mesh-bg{animation:deckMeshFloat 22s ease-in-out infinite alternate;}
@keyframes heroFloat{from{transform:translate(-3%,-2%) scale(1)}to{transform:translate(8%,6%) scale(1.16)}}
.reveal.motion .hero .hero-bg::before{content:"";position:absolute;inset:-25%;pointer-events:none;
  background:
    radial-gradient(40% 40% at 28% 32%, color-mix(in srgb,var(--accent) 42%, transparent), transparent 60%),
    radial-gradient(36% 36% at 74% 70%, color-mix(in srgb,var(--accent) 26%, transparent), transparent 60%);
  filter:blur(34px);animation:heroFloat 18s ease-in-out infinite alternate;}
}
`;

// count-up: any element with class "count" animates its number 0 -> value on enter
const MOTION_JS = `
function deckCount(el){
  var m=el.textContent.trim().match(/^(\\D*)([\\d.,\\s]+)(.*)$/);
  if(!m) return;
  var raw=m[2].replace(/[\\s,]/g,function(c){return c===','?'.':''});
  var target=parseFloat(raw); if(isNaN(target)) return;
  var dec=(raw.split('.')[1]||'').length, pre=m[1], post=m[3], orig=el.textContent, t0=0;
  function tick(now){ if(!t0)t0=now; var p=Math.min(1,(now-t0)/900), e=1-Math.pow(1-p,3);
    el.textContent=pre+(target*e).toFixed(dec)+post; if(p<1)requestAnimationFrame(tick); else el.textContent=orig; }
  requestAnimationFrame(tick);
}
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
  var run=function(s){ if(s) s.querySelectorAll('.count').forEach(deckCount); };
  Reveal.on('ready',function(e){run(e.currentSlide);});
  Reveal.on('slidechanged',function(e){run(e.currentSlide);});
} else {
  // respect reduced-motion: freeze background videos on their poster frame
  document.querySelectorAll('video').forEach(function(v){ v.removeAttribute('autoplay'); v.pause(); });
}
`;

// --- extra kinetic layouts (bento / comparison / stat-wall) -----------------
const EXTRA_CSS = `
.reveal .bento{display:grid;grid-template-columns:repeat(4,1fr);grid-auto-rows:minmax(118px,auto);gap:1em;margin-top:.5em;}
.reveal .bento-tile{background:color-mix(in srgb,var(--fg) 5%,transparent);border:1px solid color-mix(in srgb,var(--fg) 10%,transparent);border-radius:1em;padding:1em 1.1em;display:flex;flex-direction:column;justify-content:flex-end;}
.reveal .bento-tile.lg{grid-column:span 2;grid-row:span 2;}
.reveal .bento-tile.wide{grid-column:span 2;}
.reveal .bento-ic{color:var(--accent);font-size:1.5em;line-height:1;margin-bottom:.35em;}
.reveal .bento-t{font-weight:700;font-size:.82em;line-height:1.15;}
.reveal .bento-x{color:var(--muted);font-size:.62em;line-height:1.35;margin-top:.3em;}
.reveal .cmp{display:grid;grid-template-columns:1.2fr 1fr 1fr;margin-top:.6em;border-radius:1em;overflow:hidden;border:1px solid color-mix(in srgb,var(--fg) 12%,transparent);}
.reveal .cmp>div{padding:.55em .8em;font-size:.66em;line-height:1.3;border-bottom:1px solid color-mix(in srgb,var(--fg) 8%,transparent);}
.reveal .cmp .cmp-h{font-weight:700;background:color-mix(in srgb,var(--fg) 6%,transparent);}
.reveal .cmp .cmp-b{color:var(--accent);font-weight:600;background:color-mix(in srgb,var(--accent) 9%,transparent);}
.reveal .cmp .cmp-rowlab{color:var(--muted);}
.reveal .statwall{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1.4em 1em;margin-top:.7em;}
.reveal .sw-v{font-size:1.9em;font-weight:800;line-height:1;color:var(--accent);}
.reveal .sw-l{color:var(--muted);font-size:.58em;margin-top:.3em;line-height:1.3;max-width:16ch;}
@media (prefers-reduced-motion: no-preference){
.reveal.motion .present :is(.bento-tile,.sw,.cmp>div){animation:deckRise .5s cubic-bezier(.2,.7,.2,1) both;}
${stag(".bento-tile", 8, 0.12, 0.07)}
${stag(".sw", 12, 0.1, 0.05)}
}`;

// --- inline SVG charts (fill/stroke via var(--accent), no external deps) ----
const num = (v) => (Number(String(v).replace(/[^\d.-]/g, "")) || 0);

function svgBar(data) {
  const W = 640, H = 360, pad = 40, top = 34, bottom = 40, gap = 24;
  const n = data.length || 1;
  const max = Math.max(...data.map((d) => num(d.value)), 1);
  const plotW = W - pad * 2, plotH = H - top - bottom, barW = (plotW - gap * (n - 1)) / n;
  const bars = data
    .map((d, i) => {
      const h = (num(d.value) / max) * plotH;
      const x = pad + i * (barW + gap), y = top + plotH - h, cx = x + barW / 2;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="6" fill="url(#barg)"/>
      <text class="c-val" x="${cx.toFixed(1)}" y="${(y - 10).toFixed(1)}" text-anchor="middle">${esc(d.value)}</text>
      <text class="c-lab" x="${cx.toFixed(1)}" y="${H - 12}" text-anchor="middle">${esc(d.label || "")}</text>`;
    })
    .join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="barg" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--accent)"/></linearGradient></defs>
    ${bars}</svg>`;
}

function svgLine(data) {
  const W = 640, H = 360, pad = 48, top = 34, bottom = 40;
  const n = data.length || 1;
  const max = Math.max(...data.map((d) => num(d.value)), 1);
  const plotW = W - pad * 2, plotH = H - top - bottom;
  const pts = data.map((d, i) => ({
    x: pad + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW),
    y: top + plotH - (num(d.value) / max) * plotH,
    d,
  }));
  const poly = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const dots = pts
    .map(
      (p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="var(--accent)"/>
      <text class="c-lab" x="${p.x.toFixed(1)}" y="${H - 12}" text-anchor="middle">${esc(p.d.label || "")}</text>`
    )
    .join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">
    <polyline pathLength="1" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${poly}"/>
    ${dots}</svg>`;
}

function svgDonut(data) {
  const cx = 180, cy = 180, r = 120, sw = 48, C = 2 * Math.PI * r;
  const total = data.reduce((a, d) => a + num(d.value), 0) || 1;
  let off = 0;
  const segs = data
    .map((d, i) => {
      const len = (num(d.value) / total) * C;
      const op = Math.max(1 - i * 0.16, 0.3).toFixed(2);
      const el = `<circle class="seg" style="--si:${i}" cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--accent)" stroke-opacity="${op}" stroke-width="${sw}" stroke-dasharray="${len.toFixed(1)} ${(C - len).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
      off += len;
      return el;
    })
    .join("");
  return `<svg class="chart chart-donut" viewBox="0 0 360 360">${segs}</svg>`;
}

// area chart: line with gradient fill under it (same data shape as line)
function svgArea(data) {
  const W = 640, H = 360, pad = 48, top = 34, bottom = 40;
  const n = data.length || 1;
  const max = Math.max(...data.map((d) => num(d.value)), 1);
  const plotW = W - pad * 2, plotH = H - top - bottom, baseY = top + plotH;
  const pts = data.map((d, i) => ({
    x: pad + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW),
    y: top + plotH - (num(d.value) / max) * plotH,
    d,
  }));
  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${pad},${baseY.toFixed(1)} ${line} ${(pad + plotW).toFixed(1)},${baseY.toFixed(1)}`;
  const dots = pts
    .map(
      (p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="5" fill="var(--accent)"/>
      <text class="c-lab" x="${p.x.toFixed(1)}" y="${H - 12}" text-anchor="middle">${esc(p.d.label || "")}</text>`
    )
    .join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="areag" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="var(--accent)" stop-opacity=".45"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    <polygon fill="url(#areag)" points="${area}"/>
    <polyline pathLength="1" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${line}"/>
    ${dots}</svg>`;
}

// progress rings: row of circular gauges — value is a percent 0..100
function svgProgress(data) {
  const rings = data
    .map((d) => {
      const pct = Math.max(0, Math.min(100, num(d.value)));
      const r = 52, C = 2 * Math.PI * r, len = (pct / 100) * C;
      return `<div class="ring">
        <svg viewBox="0 0 140 140" class="ring-svg">
          <circle cx="70" cy="70" r="${r}" fill="none" stroke="color-mix(in srgb,var(--fg) 12%,transparent)" stroke-width="14"/>
          <circle class="ring-val" cx="70" cy="70" r="${r}" fill="none" stroke="var(--accent)" stroke-width="14" stroke-linecap="round"
            stroke-dasharray="${len.toFixed(1)} ${(C - len).toFixed(1)}" transform="rotate(-90 70 70)"/>
          <text x="70" y="79" text-anchor="middle" class="ring-num count">${pct}%</text>
        </svg>
        <div class="ring-lab">${esc(d.label || "")}</div></div>`;
    })
    .join("");
  return `<div class="rings">${rings}</div>`;
}

// --- layout renderers -------------------------------------------------------
const layouts = {
  title: (s) => `
    ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
    <h1>${esc(s.title)}</h1>
    ${s.subtitle ? `<p class="subtitle">${esc(s.subtitle)}</p>` : ""}`,

  bullets: (s) => `
    <h2>${esc(s.title)}</h2>
    <ul>${(s.bullets || [])
      .map((b) => `<li${s.animate ? ' class="fragment"' : ""}>${esc(b)}</li>`)
      .join("")}</ul>`,

  "two-column": (s) => `
    <h2>${esc(s.title)}</h2>
    <div class="cols">
      <div>${s.leftTitle ? `<div class="col-h">${esc(s.leftTitle)}</div>` : ""}
        <ul>${(s.left || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>
      <div>${s.rightTitle ? `<div class="col-h">${esc(s.rightTitle)}</div>` : ""}
        <ul>${(s.right || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>
    </div>`,

  "big-number": (s) => `
    <div class="bignum count">${esc(s.number)}</div>
    <div class="bigcap">${esc(s.caption || "")}</div>`,

  quote: (s) => `
    <blockquote><span class="q-mark">“</span>${esc(s.quote)}
      ${s.author ? `<div class="q-author">— ${esc(s.author)}</div>` : ""}
    </blockquote>`,

  closing: (s) => `
    ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
    <h1>${esc(s.title)}</h1>
    ${s.subtitle ? `<p class="subtitle">${esc(s.subtitle)}</p>` : ""}
    ${s.cta ? `<span class="cta">${esc(s.cta)}</span>` : ""}`,

  // grid of feature cards: cards[] = {icon, title, text}
  cards: (s) => `
    ${s.title ? `<h2>${esc(s.title)}</h2>` : ""}
    <div class="cards">${(s.cards || [])
      .map(
        (c) => `<div class="card${s.animate ? " fragment" : ""}">
        ${c.icon ? `<div class="card-ic">${icon(c.icon)}</div>` : ""}
        ${c.title ? `<div class="card-t">${esc(c.title)}</div>` : ""}
        ${c.text ? `<div class="card-x">${esc(c.text)}</div>` : ""}</div>`
      )
      .join("")}</div>`,

  // KPI row: items[] = {value, label}
  metrics: (s) => `
    ${s.title ? `<h2>${esc(s.title)}</h2>` : ""}
    <div class="metrics">${(s.items || [])
      .map(
        (m) => `<div class="metric"><div class="metric-v count">${esc(m.value)}</div>
        <div class="metric-l">${esc(m.label || "")}</div></div>`
      )
      .join("")}</div>`,

  // section divider: kicker + big title + accent rule
  section: (s) => `
    ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
    <h1 class="section-title">${esc(s.title)}</h1>
    ${s.subtitle ? `<p class="subtitle">${esc(s.subtitle)}</p>` : ""}`,

  // text + image split (imageSide: "left" | "right", default right)
  "image-split": (s) => {
    const cls = `img-side${s.kenburns ? " kb" : ""}${s.duotone ? " duotone" : ""}`;
    const img = `<div class="${cls}">
      <div class="img-inner" style="background-image:url('${escUrl(s.image)}')"></div>
      <div class="img-tint" aria-hidden="true"></div></div>`;
    const txt = `<div class="txt-side">
      ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
      <h2>${esc(s.title)}</h2>
      ${s.text ? `<p class="subtitle">${esc(s.text)}</p>` : ""}
      ${s.bullets ? `<ul>${(s.bullets || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
    </div>`;
    return `<div class="split">${s.imageSide === "left" ? img + txt : txt + img}</div>`;
  },

  // data chart: chartType "bar"|"donut"|"line", data[] = {label, value}
  chart: (s) => {
    const type = s.chartType || "bar";
    const data = s.data || [];
    const svg =
      type === "donut" ? svgDonut(data)
      : type === "line" ? svgLine(data)
      : type === "area" ? svgArea(data)
      : type === "progress" ? svgProgress(data)
      : svgBar(data);
    const legend =
      type === "donut"
        ? `<ul class="legend">${data
            .map(
              (d, i) =>
                `<li><span class="dot" style="opacity:${Math.max(1 - i * 0.16, 0.3).toFixed(2)}"></span>${esc(
                  d.label || ""
                )} — <b>${esc(d.value)}</b></li>`
            )
            .join("")}</ul>`
        : "";
    return `${s.title ? `<h2>${esc(s.title)}</h2>` : ""}
      ${type === "donut" ? `<div class="donut-wrap">${svg}${legend}</div>` : svg}`;
  },

  // horizontal roadmap: items[] = {date?, title, text?}
  timeline: (s) => `
    ${s.title ? `<h2>${esc(s.title)}</h2>` : ""}
    <div class="timeline">${(s.items || [])
      .map(
        (it) => `<div class="tl-item"><div class="tl-dot"></div>
        ${it.date ? `<div class="tl-date">${esc(it.date)}</div>` : ""}
        <div class="tl-t">${esc(it.title || "")}</div>
        ${it.text ? `<div class="tl-x">${esc(it.text)}</div>` : ""}</div>`
      )
      .join("")}</div>`,

  // numbered steps with arrows: steps[] = {title, text?}
  process: (s) => `
    ${s.title ? `<h2>${esc(s.title)}</h2>` : ""}
    <div class="steps">${(s.steps || [])
      .map(
        (st, i) => `<div class="step"><div class="step-n">${i + 1}</div>
        <div class="step-t">${esc(st.title || "")}</div>
        ${st.text ? `<div class="step-x">${esc(st.text)}</div>` : ""}</div>`
      )
      .join('<div class="step-arrow" aria-hidden="true">→</div>')}</div>`,

  // pricing tiers: plans[] = {name, price, period?, features[], popular?, cta?}
  pricing: (s) => `
    ${s.title ? `<h2>${esc(s.title)}</h2>` : ""}
    <div class="prices">${(s.plans || [])
      .map(
        (p) => `<div class="price${p.popular ? " popular" : ""}">
        ${p.popular ? `<div class="price-badge">${esc(p.badge || "Популярный")}</div>` : ""}
        <div class="price-name">${esc(p.name || "")}</div>
        <div class="price-v">${esc(p.price || "")}</div>
        ${p.period ? `<div class="price-p">${esc(p.period)}</div>` : ""}
        <ul>${(p.features || []).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
        ${p.cta ? `<span class="cta">${esc(p.cta)}</span>` : ""}</div>`
      )
      .join("")}</div>`,

  // logo wall: logos[] = URL string | {src, alt}
  logos: (s) => `
    ${s.title ? `<h2>${esc(s.title)}</h2>` : ""}
    <div class="logos">${(s.logos || [])
      .map((l) =>
        typeof l === "string" && !/^https?:/i.test(l)
          ? `<div class="logo logo-txt">${esc(l)}</div>`
          : `<div class="logo"><img src="${escUrl(typeof l === "string" ? l : l.src)}" alt="${esc(
              typeof l === "string" ? "" : l.alt || ""
            )}"></div>`
      )
      .join("")}</div>`,

  // kinetic full-screen thesis: text (or title), source?
  statement: (s) => `
    ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
    <div class="statement">${esc(s.text || s.title || "")}</div>
    ${s.source ? `<div class="q-author">${esc(s.source)}</div>` : ""}`,

  // asymmetric bento grid: items[] = {title, text?, icon?, span?('lg'|'wide')}
  bento: (s) => `
    ${s.title ? `<h2>${esc(s.title)}</h2>` : ""}
    <div class="bento">${(s.items || [])
      .map(
        (it) => `<div class="bento-tile${it.span ? ` ${esc(it.span)}` : ""}">
        ${it.icon ? `<div class="bento-ic">${icon(it.icon)}</div>` : ""}
        ${it.title ? `<div class="bento-t">${esc(it.title)}</div>` : ""}
        ${it.text ? `<div class="bento-x">${esc(it.text)}</div>` : ""}</div>`
      )
      .join("")}</div>`,

  // side-by-side comparison: columns {a, b}, rows[] = {label, a, b} (b column highlighted)
  comparison: (s) => {
    const cols = s.columns || {};
    return `${s.title ? `<h2>${esc(s.title)}</h2>` : ""}
      <div class="cmp">
        <div class="cmp-h"></div><div class="cmp-h">${esc(cols.a || "")}</div><div class="cmp-h cmp-b">${esc(cols.b || "")}</div>
        ${(s.rows || [])
          .map(
            (r) => `<div class="cmp-rowlab">${esc(r.label || "")}</div><div>${esc(r.a || "")}</div><div class="cmp-b">${esc(r.b || "")}</div>`
          )
          .join("")}
      </div>`;
  },

  // dense wall of many KPIs: items[] = {value, label}
  "stat-wall": (s) => `
    ${s.title ? `<h2>${esc(s.title)}</h2>` : ""}
    <div class="statwall">${(s.items || [])
      .map(
        (m) => `<div class="sw"><div class="sw-v count">${esc(m.value)}</div>
        <div class="sw-l">${esc(m.label || "")}</div></div>`
      )
      .join("")}</div>`,

  // full-bleed image cover: layered bg image (auto Ken Burns) + accent tint + overlay
  "image-cover": (s) => {
    const bg = s.video
      ? videoTag(s.video, s.poster || s.image, "cover-img")
      : `<div class="cover-img" style="background-image:url('${escUrl(s.image)}')"></div>`;
    return `<div class="cover${s.duotone ? " duotone" : ""}">
      ${bg}
      <div class="cover-tint" aria-hidden="true"></div>
      <div class="cover-inner">
        ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
        <h1>${esc(s.title)}</h1>
        ${s.subtitle ? `<p class="subtitle">${esc(s.subtitle)}</p>` : ""}
      </div></div>`;
  },
};

export function renderSlide(slide) {
  const fn = layouts[slide.layout];
  if (!fn) throw new Error(`Unknown layout: ${slide.layout}`);
  // hero:true → dark animated bg; mesh:true → soft gradient-mesh bg; morph:true → reveal auto-animate
  const cls = [];
  const layers = [];
  if (slide.hero) { cls.push("hero"); layers.push('<div class="hero-bg" aria-hidden="true"></div>'); }
  if (slide.mesh) { cls.push("mesh"); layers.push('<div class="mesh-bg" aria-hidden="true"></div>'); }
  // full-bleed background video on any layout except image-cover (which handles video itself)
  if (slide.video && slide.layout !== "image-cover") {
    cls.push("has-video");
    layers.push(videoTag(slide.video, slide.poster, "bg-video"));
  }
  const classAttr = cls.length ? ` class="${cls.join(" ")}"` : "";
  return `<section data-layout="${esc(slide.layout)}"${classAttr}${slide.morph ? " data-auto-animate" : ""}>${layers.join("")}${fn(slide)}</section>`;
}

export function renderDeck(deck) {
  const pack = PACKS[deck.template] || PACKS.aurora;
  const accent = deck.accent || pack.defaultAccent;
  const slides = (deck.slides || []).map(renderSlide).join("\n");
  const footer = deck.footer ? `<div class="footer">${esc(deck.footer)}</div>` : "";
  const motion = deck.motion === false ? "" : " motion";
  const transition = deck.transition || "slide";
  return `<!doctype html>
<html lang="${esc(deck.language || "ru")}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(deck.title || "Presentation")}</title>
${REVEAL.head}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="${pack.fontHref}" rel="stylesheet">
<style>${pack.vars(accent)}${BASE}${pack.extra || ""}${MOTION_CSS}${EXTRA_CSS}</style>
</head>
<body>
<div class="reveal${motion}"><div class="slides">
${slides}
</div></div>
${footer}
${REVEAL.script}
<script>
Reveal.initialize({width:1280,height:720,margin:0.04,minScale:0.2,maxScale:2.0,hash:true,transition:'${esc(transition)}',backgroundTransition:'fade',autoAnimateDuration:.8,controlsTutorial:false});
${MOTION_JS}
</script>
</body>
</html>`;
}
