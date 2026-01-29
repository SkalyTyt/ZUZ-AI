import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION_TEMPLATE } from '../constants';
import { getInventory } from './storageService';

// Singleton instance to hold the chat session
let chatInstance: Chat | null = null;
let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    if (!process.env.API_KEY) {
      console.error("API_KEY is missing!");
    }
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const resetChat = () => {
  chatInstance = null;
};

export const sendMessageToManager = async (message: string): Promise<string> => {
  try {
    const client = getClient();
    
    if (!chatInstance) {
      // Fetch latest inventory to inject into context
      const inventory = getInventory();
      // Format inventory for the prompt
      const inventoryString = inventory.map(p => 
        `- ${p.name} (SKU: ${p.sku}): ${p.quantity} шт. в наличии. Цена: ${p.price} руб. Описание: ${p.description}`
      ).join('\n');

      const systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE.replace('{{INVENTORY_JSON}}', inventoryString);

      chatInstance = client.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7, // Balance between creative and factual
        }
      });
    }

    const response = await chatInstance.sendMessage({ message });
    
    return response.text || "Извините, я не могу сейчас ответить. Попробуйте позже.";

  } catch (error) {
    console.error("Gemini Error:", error);
    return "Произошла ошибка связи с сервером завода. Пожалуйста, проверьте соединение.";
  }
};