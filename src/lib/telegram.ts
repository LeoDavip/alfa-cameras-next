const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const API_BASE = `https://api.telegram.org/bot${BOT_TOKEN}`;

interface TelegramResponse {
  ok: boolean;
  result?: unknown;
  description?: string;
}

export interface InlineKeyboardButton {
  text: string;
  callback_data: string;
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

export function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

export async function sendInlineKeyboard(
  text: string,
  buttons: InlineKeyboardButton[][],
  topicId?: number
) {
  const body: Record<string, unknown> = {
    chat_id: getChatId(),
    text,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons },
  };
  if (topicId) body.message_thread_id = topicId;
  return call("sendMessage", body);
}

export async function editMessageText(
  chatId: string | number,
  messageId: number,
  text: string,
  buttons?: InlineKeyboardButton[][]
) {
  const body: Record<string, unknown> = {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: "HTML",
  };
  if (buttons) body.reply_markup = { inline_keyboard: buttons };
  return call("editMessageText", body);
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const body: Record<string, unknown> = { callback_query_id: callbackQueryId };
  if (text) body.text = text;
  return call("answerCallbackQuery", body);
}
