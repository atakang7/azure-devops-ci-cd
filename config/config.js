import 'dotenv/config';

const config = {
  server: { port: Number(process.env.PORT || 3000), host: process.env.HOST || '127.0.0.1' },
  db: { uri: process.env.MONGO_URI || process.env.DB_HOST },
  security: { apiToken: process.env.API_TOKEN },
  brevo: {
    BREVO_SMTP_SERVER: process.env.BREVO_SMTP_SERVER,
    BREVO_SMTP_LOGIN: process.env.BREVO_SMTP_LOGIN,
    BREVO_SMTP_PASSWORD: process.env.BREVO_SMTP_PASSWORD,
    BREVO_SMTP_PORT: process.env.BREVO_SMTP_PORT,
  },
  telegram: {
    TELEGRAM_API_BASE_URL: process.env.TELEGRAM_API_BASE_URL,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_BOT_CHAT_ID: process.env.TELEGRAM_BOT_CHAT_ID,
  },
  openApi: { OPEN_API_KEY: process.env.OPEN_API_KEY }
};

export default config;
