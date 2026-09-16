// Narrative frameworks: turn "topic + framework" into an ordered deck skeleton so the
// MCP imposes a proven story structure (not just render whatever the model dumps).
// Each role -> a suggested layout (from render.js) + a note telling the model what to fill.
// The skeleton is a valid deck (slideSchema is .passthrough), so role/note ride along and
// the model completes the text before calling create_deck.

// role: short id · layout: existing render layout · note: what content goes here
export const FRAMEWORKS = {
  pitch: {
    name: "Инвест-питч (стандартный)",
    description: "Классический инвесторский дек: проблема → решение → рынок → тяга → команда → ask.",
    slides: [
      { role: "hook", layout: "image-cover", note: "Обложка: название, одна строка сути (что и для кого). Флаг hero/яркое фото." },
      { role: "problem", layout: "bullets", note: "Проблема: 2-3 болевых пункта конкретной аудитории, с цифрой масштаба." },
      { role: "solution", layout: "statement", note: "Решение одним крупным тезисом — как вы снимаете боль." },
      { role: "how", layout: "process", note: "Как это работает: 3-4 шага (steps)." },
      { role: "product", layout: "image-split", note: "Продукт: скриншот/фото + 3 ключевые возможности." },
      { role: "market", layout: "metrics", note: "Рынок: TAM/SAM/SOM или темп роста — реальные цифры (items value/label)." },
      { role: "traction", layout: "chart", note: "Тяга: график роста (выручка/пользователи), chartType 'area' или 'bar'." },
      { role: "business", layout: "cards", note: "Бизнес-модель: как зарабатываете, 2-4 карточки с иконками." },
      { role: "competition", layout: "two-column", note: "Конкуренты vs вы: слева 'как сейчас', справа 'с нами'." },
      { role: "team", layout: "cards", note: "Команда: ключевые люди, релевантный опыт." },
      { role: "ask", layout: "big-number", note: "Ask: сколько поднимаете и на что (number + caption)." },
      { role: "closing", layout: "closing", note: "Контакты + CTA." },
    ],
  },
  yc: {
    name: "YC-стиль (быстрый, тезисный)",
    description: "Плотный дек в духе YC: минимум слов, максимум конкретики и цифр.",
    slides: [
      { role: "oneliner", layout: "title", note: "Название + '<продукт> — <что делает> для <кого>' одной строкой." },
      { role: "problem", layout: "statement", note: "Проблема одним резким тезисом." },
      { role: "solution", layout: "image-split", note: "Что вы построили: демо/скрин + 1 предложение." },
      { role: "traction", layout: "chart", note: "Тяга вперёд всего: график 'area', реальные числа." },
      { role: "market", layout: "big-number", note: "Размер рынка одним большим числом." },
      { role: "why-now", layout: "bullets", note: "Почему сейчас: 2-3 сдвига (технология/поведение/регуляция)." },
      { role: "team", layout: "cards", note: "Почему вы: founder-market fit." },
      { role: "ask", layout: "closing", note: "Сколько поднимаете + CTA." },
    ],
  },
  "problem-solution": {
    name: "Проблема → Решение",
    description: "Универсальная убеждающая структура для B2B/продажных дек.",
    slides: [
      { role: "title", layout: "title", note: "Заголовок + подзаголовок с обещанием результата." },
      { role: "problem", layout: "bullets", note: "Боль аудитории — конкретные симптомы." },
      { role: "cost", layout: "big-number", note: "Цена бездействия: во что боль обходится (число)." },
      { role: "solution", layout: "statement", note: "Ваше решение крупным тезисом." },
      { role: "how", layout: "process", note: "Как работает: шаги." },
      { role: "proof", layout: "metrics", note: "Доказательства: результаты/метрики." },
      { role: "cta", layout: "closing", note: "Следующий шаг + контакты." },
    ],
  },
  "product-launch": {
    name: "Запуск продукта",
    description: "Дек для анонса/лендинга нового продукта или фичи.",
    slides: [
      { role: "title", layout: "image-cover", note: "Обложка запуска: имя продукта + тизер." },
      { role: "shift", layout: "statement", note: "Сдвиг в мире/рынке, который делает продукт нужным." },
      { role: "meet", layout: "image-split", note: "Знакомство с продуктом: главный визуал + суть." },
      { role: "features", layout: "cards", note: "3-6 ключевых возможностей с иконками." },
      { role: "how", layout: "process", note: "Как начать: шаги онбординга." },
      { role: "proof", layout: "logos", note: "Соц.доказательство: логотипы/цитаты клиентов." },
      { role: "pricing", layout: "pricing", note: "Тарифы (один popular:true)." },
      { role: "cta", layout: "closing", note: "Призыв: попробовать/купить." },
    ],
  },
  sales: {
    name: "Продажная презентация",
    description: "Дек для встречи с клиентом: их боль → ваш подход → доказательства → шаги.",
    slides: [
      { role: "title", layout: "title", note: "Название + для кого и зачем эта встреча." },
      { role: "pain", layout: "bullets", note: "Боль именно этого клиента (персонализируй)." },
      { role: "vision", layout: "statement", note: "Как будет, когда боль решена." },
      { role: "approach", layout: "process", note: "Ваш подход: этапы работы." },
      { role: "cases", layout: "metrics", note: "Кейсы/результаты в цифрах." },
      { role: "pricing", layout: "pricing", note: "Условия/пакеты." },
      { role: "next", layout: "closing", note: "Следующие шаги + сроки." },
    ],
  },
  report: {
    name: "Отчёт / аналитика",
    description: "Структура для отчёта: контекст → находки → анализ → рекомендации.",
    slides: [
      { role: "title", layout: "title", note: "Тема отчёта + период." },
      { role: "agenda", layout: "bullets", note: "Что внутри: 3-5 пунктов." },
      { role: "context", layout: "statement", note: "Контекст/вопрос, на который отвечает отчёт." },
      { role: "findings", layout: "metrics", note: "Ключевые находки в цифрах." },
      { role: "trend", layout: "chart", note: "Динамика: график." },
      { role: "analysis", layout: "two-column", note: "Что хорошо / что плохо, или причины/следствия." },
      { role: "reco", layout: "cards", note: "Рекомендации: 2-4 действия." },
      { role: "next", layout: "closing", note: "Следующие шаги." },
    ],
  },
};

// Build a deck skeleton the model then fills in. Keeps role/note on each slide as guidance.
export function buildOutline(topic, framework, language = "ru", template = "aurora") {
  const fw = FRAMEWORKS[framework];
  if (!fw) throw new Error(`Неизвестный фреймворк: ${framework}. Доступны: ${Object.keys(FRAMEWORKS).join(", ")}`);
  return {
    title: topic || "Presentation",
    template,
    language,
    slides: fw.slides.map((s) => ({ layout: s.layout, role: s.role, note: s.note })),
  };
}
