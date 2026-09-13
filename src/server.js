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

const execFileP = promisify(execFile);
// Output goes to a predictable, user-writable dir — NOT the package dir, which is
// read-only/ephemeral when installed via npx. Override with DECK_MCP_OUT.
const DECKS = process.env.DECK_MCP_OUT || path.join(os.homedir(), "deck-mcp-output");

const slugify = (s) =>
  (s || "deck").toLowerCase().replace(/[^a-z0-9а-я]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "deck";

const slideSchema = z
  .object({
    layout: z.enum(["title", "bullets", "two-column", "big-number", "quote", "closing"]),
  })
  .passthrough();

const deckSchema = z.object({
  title: z.string(),
  template: z.string().default("aurora"),
  accent: z.string().optional(),
  language: z.string().default("ru"),
  footer: z.string().optional(),
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
    "Слайды: layout ∈ {title,bullets,two-column,big-number,quote,closing} + поля лейаута " +
    "(title, subtitle, kicker, bullets[], leftTitle/left[], rightTitle/right[], number, caption, quote, author, cta).",
  { deck: deckSchema },
  async ({ deck }) => {
    await fs.mkdir(DECKS, { recursive: true });
    const id = `${slugify(deck.title)}-${Date.now().toString(36)}`;
    await fs.writeFile(path.join(DECKS, `${id}.json`), JSON.stringify(deck, null, 2));
    return text(`deckId: ${id}\nСлайдов: ${deck.slides.length}, тема: ${deck.template}\nДалее: render_html("${id}")`);
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
    const html = renderDeck(deck);
    const dir = path.join(DECKS, deckId);
    await fs.mkdir(dir, { recursive: true });
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
