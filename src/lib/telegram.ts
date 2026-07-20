const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

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
