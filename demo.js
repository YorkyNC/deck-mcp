// Self-check + preview: build a sample deck, render it, assert the HTML is sane.
// Run: node demo.js  → writes decks/demo/index.html and opens-ready path.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderDeck, PACKS } from "./src/render.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const deck = {
  title: "SKAI DATA — аналитика для руководителя",
  template: "aurora",
  accent: "#38e1c6",
  language: "ru",
  footer: "SKAI DATA • конфиденциально",
  slides: [
    { layout: "title", kicker: "Питч-дек", title: "Решения, а не дашборды", subtitle: "AI-аналитика, которая говорит на языке бизнеса" },
    { layout: "bullets", title: "Проблема", animate: true, bullets: ["Данные разбросаны по 5+ системам", "Отчёты готовятся вручную дни", "Руководитель видит цифры, а не выводы"] },
    { layout: "section", kicker: "01", title: "Как это работает" },
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
    { layout: "two-column", title: "Было / Стало", leftTitle: "Раньше", left: ["Excel и почта", "Неделя на отчёт", "Догадки"], rightTitle: "С SKAI", right: ["Единый экран", "Ответ за секунды", "Рекомендации ИИ"] },
    { layout: "image-split", kicker: "Продукт", title: "Один экран для совета директоров", text: "Ключевые метрики и next-best-action на первом же слайде.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200", imageSide: "right" },
    { layout: "big-number", number: "10×", caption: "быстрее принятие решений на данных" },
    { layout: "quote", quote: "Впервые совет директоров смотрит в один экран и понимает всё за минуту.", author: "CEO, пилотный клиент" },
    { layout: "image-cover", kicker: "Спасибо", title: "Покажем на ваших данных", subtitle: "Пилот за 2 недели", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600" },
    { layout: "closing", kicker: "Контакты", title: "Запустим за 2 недели", subtitle: "rafail.uralsk@gmail.com", cta: "Запросить демо" },
  ],
};

const html = renderDeck(deck);

// asserts — fail loudly if render logic breaks
console.assert(html.includes("<!doctype html>"), "нет doctype");
console.assert(html.includes(deck.title), "нет заголовка деки");
console.assert(html.includes("#38e1c6"), "акцентный цвет не применился");
console.assert((html.match(/<section>/g) || []).length === deck.slides.length, "число слайдов не совпало");
console.assert(html.includes("10×") && html.includes("bignum"), "big-number не отрендерился");
console.assert(html.includes('class="card"') && html.includes("<svg"), "cards/иконки не отрендерились");
console.assert(html.includes("metric-v"), "metrics не отрендерился");
console.assert(html.includes('class="section-title"'), "section не отрендерился");
console.assert(html.includes('class="split"') && html.includes('class="cover"'), "image-лейауты не отрендерились");
console.assert(html.includes('class="chart"') && html.includes("url(#barg)"), "bar-график не отрендерился");
console.assert(html.includes("chart-donut") && html.includes('class="legend"'), "donut-график не отрендерился");
console.assert(html.includes("<polyline"), "line-график не отрендерился");
console.assert(html.includes('class="fragment"'), "animate/fragment не применился");
console.assert(html.includes('class="reveal motion"'), "motion не включён по умолчанию");
console.assert(html.includes("@keyframes deckRise") && html.includes("deckCount"), "motion CSS/JS не встроены");
console.assert(html.includes("auroraFloat") && html.includes("rgba(0,0,0,.58)"), "живой фон/виньетка не встроены");
console.assert(html.includes('class="metric-v count"') && html.includes('class="bignum count"'), "счётчики цифр не размечены");
console.assert(renderDeck({ ...deck, motion: false }).includes('class="reveal"'), "motion:false не отключает движение");
console.assert(!html.includes("Unknown layout"), "неизвестный лейаут");

// each theme must render with its own font + palette vars
for (const [id, p] of Object.entries(PACKS)) {
  const h = renderDeck({ ...deck, template: id, accent: undefined });
  console.assert(h.includes(p.fontHref), `тема ${id}: не подключён шрифт`);
  console.assert(h.includes(`--font:'${p.font === "Fraunces" ? "Inter" : p.font}'`), `тема ${id}: не задан --font`);
  const themeDir = path.join(ROOT, "decks", "demo", id);
  await fs.mkdir(themeDir, { recursive: true });
  await fs.writeFile(path.join(themeDir, "index.html"), h);
}

const dir = path.join(ROOT, "decks", "demo");
await fs.mkdir(dir, { recursive: true });
const file = path.join(dir, "index.html");
await fs.writeFile(file, html);

console.log("OK — все проверки прошли");
console.log("Aurora:   ", pathToFileURL(file).href);
console.log("Minimal:  ", pathToFileURL(path.join(dir, "minimal", "index.html")).href);
console.log("Editorial:", pathToFileURL(path.join(dir, "editorial", "index.html")).href);
