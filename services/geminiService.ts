
import { GoogleGenAI, Type } from "@google/genai";
import { DesignBrief, ChatMessage } from "../types";

// Always use process.env.API_KEY directly as a named parameter as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a structured graphic design brief using the Gemini 3 Flash model.
 * Utilizes responseSchema for controlled JSON output.
 */
export const generateDesignBrief = async (topic: string): Promise<DesignBrief> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a realistic graphic design project brief for: ${topic}`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          clientName: { type: Type.STRING },
          projectType: { type: Type.STRING },
          objectives: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          targetAudience: { type: Type.STRING },
          styleKeywords: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['clientName', 'projectType', 'objectives', 'targetAudience', 'styleKeywords']
      }
    }
  });

  // Correctly access response.text property (not a method) as per SDK rules
  const text = response.text || '{}';
  return JSON.parse(text);
};

/**
 * Facilitates a conversational chat session with a Design Consultant persona.
 * Passes the message history to maintain conversational context.
 */
export const chatWithDesignAssistant = async (history: ChatMessage[], message: string) => {
  const ai = getAI();
  
  // Convert ChatMessage history to the Gemini SDK expected format (role 'user' or 'model')
  const formattedHistory = history.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    history: formattedHistory,
    config: {
      systemInstruction: 'You are an expert Design Consultant assistant for a famous graphic designer. You help clients understand the creative process, give advice on typography, color theory, and branding. Be professional, creative, and concise.'
    }
  });

  // Correctly extract the text property from the response
  const result = await chat.sendMessage({ message });
  return result.text || '';
};
