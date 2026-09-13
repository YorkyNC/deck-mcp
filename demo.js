// Self-check + preview: build a sample deck, render it, assert the HTML is sane.
// Run: node demo.js  → writes decks/demo/index.html and opens-ready path.
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { renderDeck } from "./src/render.js";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

const deck = {
  title: "SKAI DATA — аналитика для руководителя",
  template: "aurora",
  accent: "#38e1c6",
  language: "ru",
  footer: "SKAI DATA • конфиденциально",
  slides: [
    { layout: "title", kicker: "Питч-дек", title: "Решения, а не дашборды", subtitle: "AI-аналитика, которая говорит на языке бизнеса" },
    { layout: "bullets", title: "Проблема", bullets: ["Данные разбросаны по 5+ системам", "Отчёты готовятся вручную дни", "Руководитель видит цифры, а не выводы"] },
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
console.assert(html.includes('class="metric-v"'), "metrics не отрендерился");
console.assert(html.includes('class="section-title"'), "section не отрендерился");
console.assert(html.includes('class="split"') && html.includes('class="cover"'), "image-лейауты не отрендерились");
console.assert(!html.includes("Unknown layout"), "неизвестный лейаут");

const dir = path.join(ROOT, "decks", "demo");
await fs.mkdir(dir, { recursive: true });
const file = path.join(dir, "index.html");
await fs.writeFile(file, html);

console.log("OK — все проверки прошли");
console.log("Открыть:", pathToFileURL(file).href);
