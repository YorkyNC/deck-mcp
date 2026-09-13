// Deck JSON -> self-contained reveal.js HTML.
// One style pack for now: "aurora" (premium dark pitch). Add packs to PACKS below.

const esc = (s = "") =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Escape a URL for safe use inside a CSS url('...') / html attribute.
const escUrl = (s = "") => String(s).replace(/['"\\)]/g, "").replace(/\s/g, "%20");

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

// --- style packs -----------------------------------------------------------
export const PACKS = {
  aurora: {
    name: "Aurora",
    description: "Тёмный премиум-питч: крупная типографика, мягкое свечение, акцентный градиент.",
    defaultAccent: "#7c5cff",
    font: "Manrope",
    css: (accent) => `
:root{--accent:${accent};--bg:#0b0c14;--fg:#f4f5fb;--muted:#9aa0b4;}
.reveal{font-family:'Manrope',system-ui,sans-serif;color:var(--fg);}
.reveal .slides{text-align:left;}
.reveal .slides section{padding:0 4%;}
body{background:
  radial-gradient(60vw 60vw at 15% 0%, color-mix(in srgb,var(--accent) 32%, transparent), transparent 60%),
  radial-gradient(50vw 50vw at 100% 100%, color-mix(in srgb,var(--accent) 22%, transparent), transparent 55%),
  var(--bg);}
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
.reveal .cta{display:inline-block;margin-top:1em;padding:.55em 1.3em;border-radius:999px;background:var(--accent);color:#0b0c14;font-weight:700;font-size:.7em;}
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
/* image layouts */
.reveal .split{display:grid;grid-template-columns:1fr 1fr;gap:2em;align-items:center;min-height:64vh;}
.reveal .img-side{background-size:cover;background-position:center;background-color:color-mix(in srgb,var(--accent) 30%,var(--bg));border-radius:1em;min-height:64vh;}
.reveal .cover{display:flex;align-items:flex-end;min-height:78vh;padding:2em;border-radius:1em;background-size:cover;background-position:center;background-color:color-mix(in srgb,var(--accent) 30%,var(--bg));}
.reveal .cover-inner{max-width:22ch;}
/* charts */
.reveal .chart{width:100%;max-height:56vh;margin-top:.4em;}
.reveal .chart .c-val{fill:var(--fg);font-weight:700;font-size:20px;font-family:'Manrope',sans-serif;}
.reveal .chart .c-lab{fill:var(--muted);font-size:16px;font-family:'Manrope',sans-serif;}
.reveal .donut-wrap{display:flex;align-items:center;gap:2em;margin-top:.4em;}
.reveal .chart-donut{width:auto;height:52vh;flex:0 0 auto;}
.reveal .legend{list-style:none;margin:0;font-size:.7em;}
.reveal .legend li{margin:.4em 0;padding:0;}
.reveal .legend li::before{content:none;}
.reveal .legend .dot{display:inline-block;width:.8em;height:.8em;border-radius:3px;background:var(--accent);margin-right:.5em;vertical-align:-.05em;}
`,
  },
};

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
    <polyline fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${poly}"/>
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
      const el = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--accent)" stroke-opacity="${op}" stroke-width="${sw}" stroke-dasharray="${len.toFixed(1)} ${(C - len).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
      off += len;
      return el;
    })
    .join("");
  return `<svg class="chart chart-donut" viewBox="0 0 360 360">${segs}</svg>`;
}

// --- layout renderers -------------------------------------------------------
const layouts = {
  title: (s) => `
    ${s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : ""}
    <h1>${esc(s.title)}</h1>
    ${s.subtitle ? `<p class="subtitle">${esc(s.subtitle)}</p>` : ""}`,

  bullets: (s) => `
    <h2>${esc(s.title)}</h2>
    <ul>${(s.bullets || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`,

  "two-column": (s) => `
    <h2>${esc(s.title)}</h2>
    <div class="cols">
      <div>${s.leftTitle ? `<div class="col-h">${esc(s.leftTitle)}</div>` : ""}
        <ul>${(s.left || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>
      <div>${s.rightTitle ? `<div class="col-h">${esc(s.rightTitle)}</div>` : ""}
        <ul>${(s.right || []).map((b) => `<li>${esc(b)}</li>`).join("")}</ul></div>
    </div>`,

  "big-number": (s) => `
    <div class="bignum">${esc(s.number)}</div>
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
        (c) => `<div class="card">
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
        (m) => `<div class="metric"><div class="metric-v">${esc(m.value)}</div>
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
    const img = `<div class="img-side" style="background-image:url('${escUrl(s.image)}')"></div>`;
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
    const svg = type === "donut" ? svgDonut(data) : type === "line" ? svgLine(data) : svgBar(data);
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

  // full-bleed image cover with legibility overlay
  "image-cover": (s) => {
    const overlay = "linear-gradient(180deg,rgba(11,12,20,.15),rgba(11,12,20,.82))";
    return `<div class="cover" style="background-image:${overlay},url('${escUrl(s.image)}')">
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
  return `<section>${fn(slide)}</section>`;
}

export function renderDeck(deck) {
  const pack = PACKS[deck.template] || PACKS.aurora;
  const accent = deck.accent || pack.defaultAccent;
  const slides = (deck.slides || []).map(renderSlide).join("\n");
  const footer = deck.footer ? `<div class="footer">${esc(deck.footer)}</div>` : "";
  return `<!doctype html>
<html lang="${esc(deck.language || "ru")}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(deck.title || "Presentation")}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>${pack.css(accent)}</style>
</head>
<body>
<div class="reveal"><div class="slides">
${slides}
</div></div>
${footer}
<script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
<script>Reveal.initialize({hash:true,transition:'slide',controlsTutorial:false});</script>
</body>
</html>`;
}
