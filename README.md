# deck-mcp

MCP-сервер, который превращает описание в красивую презентацию (reveal.js HTML).
Контент придумывает твой ИИ-ассистент (Claude), сервер — красиво рендерит и публикует.

## Установка (для пользователей)

Нужен Node.js 18+ и любой MCP-клиент (Claude Code, Claude Desktop и т.п.).

**Claude Code:**
```bash
claude mcp add deck-mcp -- npx -y deck-mcp
```

**Claude Desktop** — в `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "deck-mcp": { "command": "npx", "args": ["-y", "deck-mcp"] }
  }
}
```

Перезапусти клиент. Проверка (Claude Code): `claude mcp list` → `deck-mcp ✓`.

## Использование

Просто попроси обычными словами:

> Сделай питч-дек на 7 слайдов про сервис аренды спецтехники, стиль aurora

Ассистент сам вызовет `create_deck` → `render_html` и вернёт ссылку на готовый HTML.
Готовые файлы лежат в `~/deck-mcp-output/` (переопределяется переменной `DECK_MCP_OUT`).

## Инструменты

| Инструмент | Что делает |
|------------|------------|
| `list_templates` | Список стиль-паков (сейчас: `aurora`) |
| `create_deck` | Сохраняет структуру презентации (deck-JSON), отдаёт `deckId` |
| `render_html` | Рендерит `deckId` в самодостаточный reveal.js HTML |
| `deploy` | Best-effort публикация на Vercel (нужен `vercel login`) |

## Лейауты слайдов
`title` · `section` · `bullets` · `two-column` · `cards` (сетка фич с иконками) · `metrics` (ряд KPI) · `big-number` · `image-split` · `image-cover` · `quote` · `closing`

Иконки для `cards`: `rocket, chart, users, check, star, bolt, shield, target, clock, globe, cog, heart, lock, trend, money, layers, cloud, code, mail, spark, arrow, grid, database, eye, flag`.

## Разработка
```bash
npm install
npm run demo   # self-check + пример в ~/deck-mcp-output/demo/index.html
```

## Публикация в npm (для мейнтейнера)
Имя `deck-mcp` может быть занято — при необходимости используй scope, напр. `@yourname/deck-mcp`.
```bash
npm login
npm publish --access public
```
После публикации команда установки выше заработает у всех.
