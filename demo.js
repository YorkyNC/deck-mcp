// Self-check + preview: build a sample deck, render it, assert the HTML is sane.
// Run: node demo.js  → writes decks/demo/index.html and opens-ready path.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderDeck, PACKS } from "./src/render.js";
import { FRAMEWORKS, buildOutline } from "./src/narrative.js";
import { parseBrand } from "./src/brand.js";
import { reviewDeck } from "./src/review.js";
import { findChrome } from "./src/headless.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const deck = {
  title: "SKAI DATA — аналитика для руководителя",
  template: "aurora",
  accent: "#38e1c6",
  language: "ru",
  footer: "SKAI DATA • конфиденциально",
  slides: [
    { layout: "title", hero: true, kicker: "Питч-дек", title: "Решения, а не дашборды", subtitle: "AI-аналитика, которая говорит на языке бизнеса" },
    { layout: "bullets", title: "Проблема", animate: true, bullets: ["Данные разбросаны по 5+ системам", "Отчёты готовятся вручную дни", "Руководитель видит цифры, а не выводы"] },
    { layout: "section", kicker: "01", title: "Как это работает", mesh: true },
    { layout: "cards", title: "Три опоры", cards: [
      { icon: "database", title: "Единый слой", text: "Все источники в одном месте" },
      { icon: "spark", title: "AI-выводы", text: "Не графики, а рекомендации" },
      { icon: "bolt", title: "Скорость", text: "Ответ за секунды, не за дни" },
    ] },
    { layout: "metrics", title: "В цифрах", items: [
      { value: "10×", label: "быстрее решения на данных" },
      { value: "5+", label: "источников в одном экране" },
      { value: "2 нед", label: "до первого пилота" },
    ] },
    { layout: "chart", title: "Рост выручки, млн ₸", chartType: "bar", data: [
      { label: "Q1", value: 12 }, { label: "Q2", value: 19 }, { label: "Q3", value: 27 }, { label: "Q4", value: 41 },
    ] },
    { layout: "chart", title: "Структура клиентов", chartType: "donut", data: [
      { label: "Госсектор", value: 45 }, { label: "Крупный бизнес", value: 35 }, { label: "SMB", value: 20 },
    ] },
    { layout: "chart", title: "Активные пользователи", chartType: "line", data: [
      { label: "Янв", value: 200 }, { label: "Мар", value: 480 }, { label: "Июн", value: 910 }, { label: "Сен", value: 1600 },
    ] },
    { layout: "chart", title: "Выручка нарастающим итогом, млн ₸", chartType: "area", data: [
      { label: "Q1", value: 12 }, { label: "Q2", value: 31 }, { label: "Q3", value: 58 }, { label: "Q4", value: 99 },
    ] },
    { layout: "chart", title: "Ключевые показатели", chartType: "progress", data: [
      { label: "Удержание клиентов", value: 92 }, { label: "Точность прогноза", value: 87 }, { label: "Автоматизация отчётов", value: 78 },
    ] },
    { layout: "statement", kicker: "Тезис", text: "Данные должны отвечать на вопросы, а не задавать новые." },
    { layout: "timeline", title: "Дорожная карта", items: [
      { date: "Q1", title: "Пилот", text: "Первый клиент на данных" },
      { date: "Q2", title: "Интеграции", text: "5+ источников из коробки" },
      { date: "Q3", title: "AI-инсайты", text: "Рекомендации, не графики" },
      { date: "Q4", title: "Масштаб", text: "10 корпоративных клиентов" },
    ] },
    { layout: "process", title: "Как это работает", steps: [
      { title: "Подключаем", text: "Все источники в единый слой" },
      { title: "Анализируем", text: "AI находит закономерности" },
      { title: "Рекомендуем", text: "Готовое next-best-action" },
    ] },
    { layout: "pricing", title: "Тарифы", plans: [
      { name: "Старт", price: "290k ₸", period: "в месяц", features: ["1 дашборд", "3 источника", "Почта-поддержка"] },
      { name: "Бизнес", price: "690k ₸", period: "в месяц", popular: true, features: ["Безлимит дашбордов", "10+ источников", "AI-инсайты", "Приоритет-поддержка"], cta: "Выбрать" },
      { name: "Энтерпрайз", price: "Договорная", features: ["On-premise", "SLA 99.9%", "Выделенный менеджер"] },
    ] },
    { layout: "logos", title: "Нам доверяют", logos: ["KAZ Minerals", "Air Astana", "Kaspi", "Halyk", "QazaqGaz", "Beeline"] },
    { layout: "two-column", title: "Было / Стало", leftTitle: "Раньше", left: ["Excel и почта", "Неделя на отчёт", "Догадки"], rightTitle: "С SKAI", right: ["Единый экран", "Ответ за секунды", "Рекомендации ИИ"] },
    { layout: "image-split", kicker: "Продукт", title: "Один экран для совета директоров", text: "Ключевые метрики и next-best-action на первом же слайде.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200", imageSide: "right", kenburns: true },
    { layout: "big-number", number: "10×", caption: "быстрее принятие решений на данных" },
    { layout: "quote", quote: "Впервые совет директоров смотрит в один экран и понимает всё за минуту.", author: "CEO, пилотный клиент" },
    { layout: "section", kicker: "Демо", title: "Видео-фон", video: "https://cdn.example.com/sample.mp4", poster: "https://picsum.photos/seed/vid/1600/900" },
    { layout: "image-cover", kicker: "Спасибо", title: "Покажем на ваших данных", subtitle: "Пилот за 2 недели", video: "https://cdn.example.com/cover.mp4", poster: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600", duotone: true },
    { layout: "closing", kicker: "Контакты", title: "Запустим за 2 недели", subtitle: "rafail.uralsk@gmail.com", cta: "Запросить демо" },
  ],
};

const html = renderDeck(deck);

// asserts — fail loudly if render logic breaks
console.assert(html.includes("<!doctype html>"), "нет doctype");
console.assert(html.includes(deck.title), "нет заголовка деки");
console.assert(html.includes("#38e1c6"), "акцентный цвет не применился");
console.assert((html.match(/<section[ >]/g) || []).length === deck.slides.length, "число слайдов не совпало");
console.assert(html.includes("10×") && html.includes("bignum"), "big-number не отрендерился");
console.assert(html.includes('class="card"') && html.includes("<svg"), "cards/иконки не отрендерились");
console.assert(html.includes("metric-v"), "metrics не отрендерился");
console.assert(html.includes('class="section-title"'), "section не отрендерился");
console.assert(html.includes('class="split"') && html.includes('class="cover'), "image-лейауты не отрендерились");
console.assert(html.includes('class="cover-img"') && html.includes("deckKenburns"), "Ken Burns на обложке не встроен");
console.assert(html.includes('class="cover duotone"') && html.includes('class="cover-tint"'), "duotone на обложке не применился");
console.assert(html.includes('img-side kb') && html.includes('class="img-inner"'), "kenburns на image-split не применился");
console.assert(html.includes('class="mesh"') && html.includes('class="mesh-bg"') && html.includes("deckMeshFloat"), "mesh-фон не встроен");
console.assert(html.includes('class="chart"') && html.includes("url(#barg)"), "bar-график не отрендерился");
console.assert(html.includes("chart-donut") && html.includes('class="legend"'), "donut-график не отрендерился");
console.assert(html.includes("<polyline"), "line-график не отрендерился");
console.assert(html.includes("<polygon") && html.includes("url(#areag)"), "area-график не отрендерился");
console.assert(html.includes('class="rings"') && html.includes("ring-val") && html.includes("deckRing"), "progress-кольца не отрендерились");
console.assert(html.includes('class="statement"') && html.includes("deckWipe"), "statement не отрендерился");
console.assert(html.includes('class="timeline"') && html.includes('class="tl-dot"'), "timeline не отрендерился");
console.assert(html.includes('class="steps"') && html.includes('class="step-n"') && html.includes("step-arrow"), "process не отрендерился");
console.assert(html.includes('class="price popular"') && html.includes("price-badge"), "pricing не отрендерился");
console.assert(html.includes('class="logos"') && html.includes("logo-txt"), "logos не отрендерился");
console.assert(html.includes('class="has-video"') && html.includes('class="bg-video"'), "видео-фон слайда не отрендерился");
console.assert(html.includes('<video class="cover-img"') && html.includes('poster='), "видео-обложка не отрендерилась");
console.assert(html.includes('v.pause()'), "пауза видео при reduced-motion не встроена");
console.assert(html.includes('class="fragment"'), "animate/fragment не применился");
console.assert(html.includes('class="reveal motion"'), "motion не включён по умолчанию");
console.assert(html.includes("@keyframes deckRise") && html.includes("deckCount"), "motion CSS/JS не встроены");
console.assert(html.includes("auroraFloat") && html.includes("rgba(0,0,0,.58)"), "живой фон/виньетка не встроены");
console.assert(html.includes('class="hero"') && html.includes('class="hero-bg"') && html.includes("heroFloat"), "hero-фон не встроен");
console.assert(html.includes('class="metric-v count"') && html.includes('class="bignum count"'), "счётчики цифр не размечены");
console.assert(renderDeck({ ...deck, motion: false }).includes('class="reveal"'), "motion:false не отключает движение");
console.assert(!html.includes("Unknown layout"), "неизвестный лейаут");
// Phase 0: self-contained output (no CDN) + explicit stage size for large-screen scaling
console.assert(!html.includes("cdn.jsdelivr"), "reveal.js не инлайнен — остался CDN");
console.assert(html.includes("width:1280,height:720") && html.includes("maxScale:2.0"), "размеры сцены не заданы — ломается на больших экранах");

// each theme must render with its own font + palette vars
for (const [id, p] of Object.entries(PACKS)) {
  const h = renderDeck({ ...deck, template: id, accent: undefined });
  console.assert(h.includes(p.fontHref), `тема ${id}: не подключён шрифт`);
  console.assert(h.includes(`--font:'${p.font === "Fraunces" ? "Inter" : p.font}'`), `тема ${id}: не задан --font`);
  const themeDir = path.join(ROOT, "decks", "demo", id);
  await fs.mkdir(themeDir, { recursive: true });
  await fs.writeFile(path.join(themeDir, "index.html"), h);
}

// Phase 1: narrative frameworks reference only known layouts, and outlines are valid decks
const KNOWN = new Set(["title","bullets","two-column","big-number","quote","closing","cards","metrics","section","image-split","image-cover","chart","timeline","process","pricing","logos","statement"]);
for (const [id, fw] of Object.entries(FRAMEWORKS)) {
  console.assert(fw.slides.length >= 3, `framework ${id}: слишком короткий`);
  for (const s of fw.slides) console.assert(KNOWN.has(s.layout), `framework ${id}: неизвестный layout '${s.layout}'`);
}
const outline = buildOutline("Тест", "pitch");
console.assert(outline.slides.every((s) => s.note && s.role && s.layout), "outline: слайд без note/role/layout");
console.assert(renderDeck(outline).includes('class="reveal'), "outline не рендерится");

// Phase 2: brand parsing pulls accent/logo/font/template from markup
const sampleHtml = `<meta name="theme-color" content="#ff5a1f">
<meta property="og:image" content="/logo.png">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700">
<body style="background:#0a0a0a">`;
const brand = parseBrand(sampleHtml, "https://acme.io");
console.assert(brand.accent === "#ff5a1f", `brand accent: ${brand.accent}`);
console.assert(brand.logo === "https://acme.io/logo.png", `brand logo: ${brand.logo}`);
console.assert(brand.font === "Space Grotesk", `brand font: ${brand.font}`);
console.assert(brand.template === "aurora", `brand template (dark bg -> aurora): ${brand.template}`);

// Phase 5: new kinetic layouts render
const x = renderDeck({
  title: "layouts", template: "aurora",
  slides: [
    { layout: "bento", title: "B", items: [{ title: "t", text: "x", icon: "rocket", span: "lg" }, { title: "u" }] },
    { layout: "comparison", title: "C", columns: { a: "Сейчас", b: "С нами" }, rows: [{ label: "Скорость", a: "медленно", b: "быстро" }] },
    { layout: "stat-wall", title: "S", items: [{ value: "10×", label: "рост" }, { value: "2.4M", label: "юзеров" }] },
  ],
});
console.assert(x.includes('class="bento"') && x.includes("bento-tile lg"), "bento не отрендерился");
console.assert(x.includes('class="cmp"') && x.includes("cmp-b"), "comparison не отрендерился");
console.assert(x.includes('class="statwall"') && x.includes('data-layout="stat-wall"'), "stat-wall не отрендерился");
console.assert(!x.includes("Unknown layout"), "новый лейаут неизвестен");

const dir = path.join(ROOT, "decks", "demo");
await fs.mkdir(dir, { recursive: true });
const file = path.join(dir, "index.html");
await fs.writeFile(file, html);

// Phase 3: visual review (skipped if no Chrome, so npm test stays green everywhere)
if (findChrome() && !process.env.DECK_MCP_NO_BROWSER) {
  const r = await reviewDeck(pathToFileURL(file).href);
  console.assert(r.total > 0 && Array.isArray(r.issues), "review_deck не вернул результат");
  console.log(`Review: ${r.total} слайдов, проблем ${r.issues.length}`);
} else {
  console.log("Review: пропущено (нет Chrome / DECK_MCP_NO_BROWSER)");
}

console.log("OK — все проверки прошли");
console.log("Aurora:   ", pathToFileURL(file).href);
console.log("Noir:     ", pathToFileURL(path.join(dir, "noir", "index.html")).href);
console.log("Minimal:  ", pathToFileURL(path.join(dir, "minimal", "index.html")).href);
console.log("Editorial:", pathToFileURL(path.join(dir, "editorial", "index.html")).href);
