import axios from 'axios';
import config from '../../config/config.js';

export async function sendTelegramMessage(message) {
  const { TELEGRAM_API_BASE_URL: base, TELEGRAM_BOT_TOKEN: token,
    TELEGRAM_BOT_CHAT_ID: chatId } = config.telegram;
  if (!base || !token || !chatId) return;
  try {
    await axios.post(`${base}${token}/sendMessage`, { chat_id: chatId, text: message },
      { timeout: 5000 });
  } catch {
    // Optional alerts must not block API responses or leak provider details.
    console.warn('Telegram notification failed');
  }
}
