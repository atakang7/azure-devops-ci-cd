import { Router } from 'express';
import {
  getChatbotResponse,
} from '../controllers/chatBotController.js';
import multer from 'multer';
import os from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (_req, _file, cb) => cb(null, 'diagnostic-upload-' + randomUUID())
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('audio/'))
});

/**
 * @swagger
 * tags:
 *   name: Chatbot
 *   description: Chatbot API
 */
const router = Router();

/**
 * @swagger
 * /get-chatbot-response:
 *   post:
 *     summary: Get the chatbot response
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Chatbot response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   description: The chatbot response
 *       '500':
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The error message
 */
router.post('/get-chatbot-response', upload.single('audio'), getChatbotResponse);

export default router;

