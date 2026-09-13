// Deck JSON -> self-contained reveal.js HTML.
// One style pack for now: "aurora" (premium dark pitch). Add packs to PACKS below.

const esc = (s = "") =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

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
`,
  },
};

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
