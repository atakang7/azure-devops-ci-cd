import config from '../config/config.js';
import fs from 'node:fs';
import { Types } from 'mongoose';
import OpenAI from 'openai';
import Apps from '../models/appsModel.js';
import Foods from '../models/foodsModel.js';

export const getChatbotResponse = async (req, res) => {
  const mp3FilePath = req.file?.path;
  if (!mp3FilePath) {
    return res.status(400).json({ message: 'No audio file uploaded' });
  }
  try {
    if (!config.openApi.OPEN_API_KEY) {
      return res.status(503).json({ message: 'Speech transcription is not configured' });
    }
    if (!Types.ObjectId.isValid(req.body.hotelId)) {
      return res.status(400).json({ message: 'hotelId must be a valid object ID' });
    }
    const openai = new OpenAI({
      apiKey: config.openApi.OPEN_API_KEY,
      timeout: 60_000,
      maxRetries: 1
    });
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: fs.createReadStream(mp3FilePath),
      model: 'whisper-1',
      response_format: 'text',
    });

    const query = transcriptionResponse;

    const objectId = new Types.ObjectId(req.body.hotelId);
    const apps = await Apps.find({ hotel: objectId });
    const foods = await Foods.find({ hotel: objectId });
    const foodNames = foods.map(food => food.name);
    const appNames = apps.map(app => app.name);

    const prompt = `
    You are a TV assistant in a hotel designed to enhance the guest experience. Your main functions are to help users order food and open apps when requested, and to engage in natural conversation on various topics.
    
    **Available Services:**
    
    1. **Food Ordering:**
       - You can assist the user in ordering food from the following options when they express interest in ordering:
         ${JSON.stringify(foodNames, null, 2)}
    
    2. **App Access:**
       - You can help the user open these apps when they request to do so:
         ${JSON.stringify(appNames, null, 2)}
    
    **User Interaction Guidelines:**
    
    - Engage in natural, friendly conversation on any topic the user brings up.
    - If the user explicitly asks about food options or expresses a desire to order, provide options from the available list.
    - If the user specifically requests to open an app, offer options from the available list.
    - Keep the interaction friendly and informative, focusing on the user's needs and interests rather than promoting services.
    - Provide a clear and concise response to the user's request. Keep it one sentence and not like a paragraph.  
    
    **Response Format:**
    
    Your response should be in the following JSON format:
    
    {
      "message": "Your response to the user based on their request or continuing the conversation naturally.",
      "food": "Name of the food item if the user explicitly wants to order food. Omit this key if not applicable.",
      "app": "Name of the app if the user explicitly wants to open an app. Omit this key if not applicable."
    }
    
    Chat History:
    System: ${String(req.body.history || '').slice(0, 4000)}
    `;

    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: query },
      ],
    });

    const answer = chatResponse.choices[0].message.content;
 
    res.status(200).json({ answer });
  } catch (error) {
    console.error('Speech request failed:', error);
    res.status(502).json({ message: 'Speech service unavailable' });
  } finally {
    try {
      await fs.promises.rm(mp3FilePath, { force: true });
    } catch (error) {
      console.error('Failed to remove temporary audio:', error);
    }
  }
};

