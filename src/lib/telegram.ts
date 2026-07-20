const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

const TOPICS = {
  arquivos: Number(process.env.TELEGRAM_TOPIC_ARQUIVOS) || undefined,
  orcamentos: Number(process.env.TELEGRAM_TOPIC_ORCAMENTOS) || undefined,
  relatorios: Number(process.env.TELEGRAM_TOPIC_RELATORIOS) || undefined,
  logs: Number(process.env.TELEGRAM_TOPIC_LOGS) || undefined,
} as const;

async function call(method: string, body: Record<string, unknown>): Promise<TelegramResponse> {
  const res = await fetch(`${API_BASE}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function sendMessage(chatId: string | number, text: string, options?: Record<string, unknown>) {
  return call("sendMessage", { chat_id: chatId, text, parse_mode: "HTML", ...options });
}

export async function sendDocument(chatId: string | number, document: string, caption?: string) {
  return call("sendDocument", { chat_id: chatId, document, caption });
}

export async function sendMarkdown(chatId: string | number, text: string) {
  return call("sendMessage", { chat_id: chatId, text, parse_mode: "MarkdownV2" });
}

function getChatId() {
  if (!CHAT_ID) throw new Error("TELEGRAM_CHAT_ID not configured");
  return CHAT_ID;
}

export async function notify(topic: keyof typeof TOPICS, text: string) {
  const body: Record<string, unknown> = { chat_id: getChatId(), text, parse_mode: "HTML" };
  if (TOPICS[topic]) body.message_thread_id = TOPICS[topic];
  return call("sendMessage", body);
}
