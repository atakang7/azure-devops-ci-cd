import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import expressPartials from 'express-partials';
import config from './config/config.js';
import db, { connectDatabase, closeDatabase } from './apis/db/cosmosDB.js';
import userRouter from './routes/userRouter.js';
import chatbotRouter from './routes/chatbotRouter.js';
import contentRouter from './routes/contentRouter.js';
import hotelsRouter from './routes/hotelsRouter.js';
import foodsRouter from './routes/foodsRouter.js';
import roomRouter from './routes/roomRouter.js';
import appsRouter from './routes/appsRouter.js';
import { swaggerUi, swaggerSpec } from './swagger.js';

export const app = express();
const root = path.dirname(fileURLToPath(import.meta.url));

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.set('view engine', 'ejs');
app.set('views', path.join(root, 'views'));
app.use(expressPartials());

app.get('/healthz', (_req, res) => res.status(200).json({ status: 'alive' }));
app.get('/readyz', (_req, res) => res.status(db.readyState === 1 ? 200 : 503)
  .json({ status: db.readyState === 1 ? 'ready' : 'unavailable' }));

function verifyApiToken(req, res, next) {
  const secret = config.security.apiToken;
  const supplied = req.get('authorization') || '';
  const bearer = secret ? `Bearer ${secret}` : '';
  const basic = secret ? 'Basic ' + Buffer.from('operator:' + secret).toString('base64') : '';
  const equal = (value) => supplied.length === value.length &&
    timingSafeEqual(Buffer.from(supplied), Buffer.from(value));
  if (!secret || (!equal(bearer) && !equal(basic))) {
    res.set('WWW-Authenticate', 'Basic realm="Local demo"');
    return res.status(401).json({ message: 'Authorization required' });
  }
  return next();
}
app.use('/docs', verifyApiToken, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/', verifyApiToken, contentRouter);
app.use('/users', verifyApiToken, userRouter);
app.use('/chatbot', verifyApiToken, chatbotRouter);
app.use('/hotels', verifyApiToken, hotelsRouter);
app.use('/foods', verifyApiToken, foodsRouter);
app.use('/rooms', verifyApiToken, roomRouter);
app.use('/apps', verifyApiToken, appsRouter);
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, _req, res, _next) => {
  console.error('Request failed:', err);
  res.status(err.status || 500).json({ message: err.status && err.status < 500 ? err.message : 'Internal server error' });
});

export async function startServer() {
  if (!config.security.apiToken || config.security.apiToken.length < 24) {
    throw new Error('API_TOKEN must contain at least 24 characters');
  }
  if (!Number.isInteger(config.server.port) || config.server.port < 0 || config.server.port > 65535) {
    throw new Error('Invalid PORT');
  }
  await connectDatabase(config.db.uri);
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(config.server.port, config.server.host);
    listener.once('listening', () => resolve(listener));
    listener.once('error', reject);
  });
  const stop = () => {
    server.close(() => closeDatabase()
      .then(() => process.exit(0), () => process.exit(1)));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().catch(error => {
    console.error('Startup failed:', error.message);
    process.exitCode = 1;
  });
}
