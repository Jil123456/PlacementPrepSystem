const { GoogleGenAI } = require('@google/genai');
const { successResponse, errorResponse } = require('../utils/helpers');

let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const SYSTEM_INSTRUCTION = `
You are an AI placement mentor. Keep answers EXTREMELY short and direct.
Do not ramble. Give the core concept in 2-3 sentences max.
Format your responses using Markdown.
`;

async function handleChat(req, res, next) {
  try {
    if (!ai) {
      return res.status(503).json(errorResponse('AI service is not configured (GEMINI_API_KEY is missing).'));
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json(errorResponse('Messages array is required.'));
    }

    // Truncate to the last 10 messages for context window
    const recentMessages = messages.slice(-10);

    // Format for Gemini
    const contents = recentMessages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: 200,
        temperature: 0.5
      }
    });

    return res.json(successResponse({
      message: response.text
    }));
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json(errorResponse('Failed to generate AI response.'));
  }
}

module.exports = { handleChat };
