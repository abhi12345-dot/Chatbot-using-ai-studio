import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getChatResponse(
  modelId: string,
  history: Message[],
  userMessage: string
) {
  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: "You are a helpful, creative, and clever assistant. Format your responses using Markdown.",
    },
    // Convert history to the format expected by the SDK
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }))
  });

  const result = await chat.sendMessage({ message: userMessage });
  return result.text;
}

export async function* getChatResponseStream(
  modelId: string,
  history: Message[],
  userMessage: string
) {
  const chat = ai.chats.create({
    model: modelId,
    config: {
      systemInstruction: "You are a helpful, creative, and clever assistant. Format your responses using Markdown.",
    },
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }))
  });

  const result = await chat.sendMessageStream({ message: userMessage });
  for await (const chunk of result) {
    yield chunk.text;
  }
}
