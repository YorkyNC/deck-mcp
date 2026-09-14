#!/usr/bin/env node
// deck-mcp — thin MCP server: store deck-JSON, render reveal.js HTML, best-effort deploy.
// Content is authored by the LLM (the MCP client); this server only validates + renders.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";
import { renderDeck, PACKS } from "./render.js";
import { localizeAssets } from "./media.js";

const execFileP = promisify(execFile);
// Output goes to a predictable, user-writable dir — NOT the package dir, which is
// read-only/ephemeral when installed via npx. Override with DECK_MCP_OUT.
const DECKS = process.env.DECK_MCP_OUT || path.join(os.homedir(), "deck-mcp-output");

const slugify = (s) =>
  (s || "deck").toLowerCase().replace(/[^a-z0-9а-я]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "deck";

const slideSchema = z
  .object({
    layout: z.enum([
      "title", "bullets", "two-column", "big-number", "quote", "closing",
      "cards", "metrics", "section", "image-split", "image-cover", "chart",
      "timeline", "process", "pricing", "logos", "statement",
    ]),
  })
  .passthrough();

const deckSchema = z.object({
  title: z.string(),
  template: z.string().default("aurora"),
  accent: z.string().optional(),
  language: z.string().default("ru"),
  footer: z.string().optional(),
  transition: z.string().optional(),
  motion: z.boolean().optional(),
  slides: z.array(slideSchema).min(1),
});

const text = (t) => ({ content: [{ type: "text", text: t }] });

const server = new McpServer({ name: "deck-mcp", version: "0.1.0" });

server.tool(
  "list_templates",
  "Список доступных стиль-паков (тем оформления) для презентаций.",
  {},
  async () =>
    text(
      Object.entries(PACKS)
        .map(([id, p]) => `• ${id} — ${p.name}: ${p.description} (шрифт ${p.font}, акцент по умолчанию ${p.defaultAccent})`)
        .join("\n")
    )
);

server.tool(
  "create_deck",
  "Сохранить deck-JSON (структуру + контент презентации, заполненную моделью). Возвращает deckId. " +
    "Слайды: layout + поля лейаута. Не делай дек только из bullets — чередуй визуальные лейауты. Лейауты:\n" +
    "• title/closing/section — kicker, title, subtitle (+cta у closing)\n" +
    "• bullets — title, bullets[]\n" +
    "• two-column — title, leftTitle/left[], rightTitle/right[]\n" +
    "• big-number — number, caption\n" +
    "• quote — quote, author\n" +
    "• cards — title, cards[]{icon,title,text} — сетка фич\n" +
    "• metrics — title, items[]{value,label} — ряд KPI\n" +
    "• image-split — title, text/bullets[], image(URL), imageSide('left'|'right')\n" +
    "• image-cover — title, subtitle, kicker, image(URL) — обложка на весь экран\n" +
    "• chart — title, chartType('bar'|'donut'|'line'|'area'|'progress'), data[]{label,value} — график; area=линия с градиентной заливкой, progress=кольца (value=процент 0..100)\n" +
    "• timeline — title, items[]{date,title,text} — горизонтальный роадмап с точками\n" +
    "• process — title, steps[]{title,text} — нумерованные шаги со стрелками (как это работает)\n" +
    "• pricing — title, plans[]{name,price,period,features[],popular,cta} — тарифы карточками (popular:true подсвечивает)\n" +
    "• logos — title, logos[] (URL картинки или строка-название) — стена логотипов/партнёров\n" +
    "• statement — text (или title), source — крупный кинетический тезис на весь экран\n" +
    "icon ∈ {rocket,chart,users,check,star,bolt,shield,target,clock,globe,cog,heart,lock,trend,money,layers,cloud,code,mail,spark,arrow,grid,database,eye,flag}.\n" +
    "template (тема): 'aurora' (тёмная премиум), 'noir' (глубокий чёрный, драма), 'minimal' (светлая корпоративная), 'editorial' (журнальная серифная).\n" +
    "Флаг слайда hero:true — оживлённый тёмный фон с затемнением на этом слайде (в любой теме); идеально для title/section/cover.\n" +
    "Флаг слайда mesh:true — мягкий градиентный фон-меш из цветных пятен (светлая альтернатива hero, работает и на светлых темах).\n" +
    "Флаги картинок (image-cover/image-split): duotone:true — фото в один тон под акцент для единого бренда; kenburns:true (image-split) — медленный кино-зум; на image-cover зум включён автоматически.\n" +
    "АНИМАЦИЯ включена по умолчанию: каскадный вход контента, цифры отсчитываются от 0, графики рисуются. " +
    "Ничего включать не надо. motion:false — отключить всё движение.\n" +
    "Для ВАУ-эффекта: делай деки насыщенными — 8–14 слайдов, много конкретных ЦИФР (используй metrics и big-number: '10×', '+247%', '2.4 млн'), " +
    "минимум сплошного текста, чередуй лейауты, добавляй chart и cards с иконками, обложку image-cover. " +
    "Флаг слайда animate:true — буллеты/карточки по клику (для докладов). " +
    "Флаг слайда morph:true на ДВУХ соседних слайдах — общий элемент плавно перетекает между ними (кинематографичный переход).",
  { deck: deckSchema },
  async ({ deck }) => {
    await fs.mkdir(DECKS, { recursive: true });
    const id = `${slugify(deck.title)}-${Date.now().toString(36)}`;
    await fs.writeFile(path.join(DECKS, `${id}.json`), JSON.stringify(deck, null, 2));
    return text(`deckId: ${id}\nСлайдов: ${deck.slides.length}, тема: ${deck.template}\nДалее: render_html("${id}")`);
  }
);

const slugify2 = (s) => slugify(s).slice(0, 24);

server.tool(
  "find_media",
  "Найти реальные фото/видео по ключевику через Pixabay (нужен PIXABAY_API_KEY). " +
    "Возвращает список прямых URL — выбери подходящий и вставь в слайд: фото → image:\"...\"; " +
    "видео → video:\"...\" (poster:\"...\" для кадра-заставки; работает на image-cover и как фон любого слайда). " +
    "Пиши query по-английски — база стоков англоязычная (напр. 'aerial wind turbines', 'team meeting office'). " +
    "Без ключа: фото → плейсхолдеры Picsum (не по теме, для черновика), видео → недоступно. " +
    "URL при render_html скачиваются локально в деку (лицензия Pixabay требует кэширования, хотлинк запрещён).",
  {
    query: z.string(),
    kind: z.enum(["photo", "video"]).default("photo"),
    orientation: z.enum(["horizontal", "vertical", "all"]).default("horizontal"),
    count: z.number().int().min(1).max(12).default(6),
  },
  async ({ query, kind = "photo", orientation = "horizontal", count = 6 }) => {
    const key = process.env.PIXABAY_API_KEY;
    const pp = Math.min(Math.max(count, 3), 20);
    if (!key) {
      if (kind === "video")
        return text("Видео недоступно без ключа. Задай PIXABAY_API_KEY (бесплатно: pixabay.com/api/docs) и повтори.");
      const base = slugify2(query) || "img";
      const list = Array.from({ length: count }, (_, i) => `${i + 1}. https://picsum.photos/seed/${base}-${i + 1}/1600/900`).join("\n");
      return text(`Без PIXABAY_API_KEY — плейсхолдеры (не по теме "${query}"):\n${list}\n\nВставь URL в image:"...". Для реальных фото задай ключ.`);
    }
    const q = encodeURIComponent(query);
    const url =
      kind === "video"
        ? `https://pixabay.com/api/videos/?key=${key}&q=${q}&safesearch=true&per_page=${pp}`
        : `https://pixabay.com/api/?key=${key}&q=${q}&image_type=photo&safesearch=true&orientation=${orientation}&per_page=${pp}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`Pixabay HTTP ${res.status}`);
      const data = await res.json();
      const hits = (data.hits || []).slice(0, count);
      if (!hits.length) return text(`Ничего не найдено по "${query}". Попробуй другой (английский) запрос.`);
      const lines = hits.map((h, i) => {
        if (kind === "video") {
          const v = h.videos?.large?.url ? h.videos.large : h.videos?.medium || h.videos?.small || {};
          const poster = (h.videos?.large || h.videos?.medium || {}).thumbnail || "";
          return `${i + 1}. ${v.url}\n   poster: ${poster}\n   ${v.width || "?"}x${v.height || "?"} · © ${h.user || "?"}`;
        }
        return `${i + 1}. ${h.largeImageURL}\n   ${h.imageWidth}x${h.imageHeight} · © ${h.user || "?"}`;
      });
      const how =
        kind === "video"
          ? 'Вставь: video:"URL", poster:"poster-URL".'
          : 'Вставь: image:"URL".';
      return text(`Pixabay (${kind}) по "${query}":\n${lines.join("\n")}\n\n${how}`);
    } catch (e) {
      return text(`Не удалось получить медиа: ${e.message}. Проверь PIXABAY_API_KEY и сеть.`);
    }
  }
);

async function loadDeck(deckId) {
  const raw = await fs.readFile(path.join(DECKS, `${deckId}.json`), "utf8");
  return JSON.parse(raw);
}


server.tool(
  "render_html",
  "Отрендерить сохранённую деку в самодостаточный reveal.js HTML. Возвращает путь и file:// ссылку для просмотра.",
  { deckId: z.string() },
  async ({ deckId }) => {
    const deck = await loadDeck(deckId);
    const dir = path.join(DECKS, deckId);
    await fs.mkdir(dir, { recursive: true });
    await localizeAssets(deck, dir); // download remote media into <deckId>/assets/, rewrite URLs
    const html = renderDeck(deck);
    const file = path.join(dir, "index.html");
    await fs.writeFile(file, html);
    return text(`HTML: ${file}\nОткрыть: ${pathToFileURL(file).href}\nОпубликовать: deploy("${deckId}")`);
  }
);

server.tool(
  "deploy",
  "Best-effort деплой отрендеренной деки на Vercel (нужен `vercel login`). Возвращает публичную ссылку или инструкцию.",
  { deckId: z.string() },
  async ({ deckId }) => {
    const dir = path.join(DECKS, deckId);
    try {
      await fs.access(path.join(dir, "index.html"));
    } catch {
      return text(`Сначала render_html("${deckId}") — index.html ещё не создан.`);
    }
    try {
      const { stdout } = await execFileP("npx", ["--yes", "vercel", "deploy", dir, "--yes", "--prod"], {
        cwd: dir,
        timeout: 120000,
      });
      const url = (stdout.match(/https?:\/\/\S+/) || []).pop();
      return text(url ? `Опубликовано: ${url}` : `Vercel вернул:\n${stdout}`);
    } catch (e) {
      return text(
        `Не удалось задеплоить (обычно — нужен вход). Выполни в терминале:\n` +
          `  npx vercel login\n  npx vercel deploy "${dir}" --prod\n\nОшибка: ${e.message}`
      );
    }
  }
);

await server.connect(new StdioServerTransport());
