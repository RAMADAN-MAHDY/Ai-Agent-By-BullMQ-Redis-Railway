import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINIAI_API_KEY });
// we have  only 5 requests per minute

export const generateEmbedding = async (text) => {
    try {
      const result = await ai.models.embedContent({
        model: 'gemini-embedding-exp-03-07',
        contents: text,
      });
      return result.embeddings[0].values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  };