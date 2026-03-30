export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
}

export type ModelType = 'gemini-3.1-pro-preview' | 'gemini-3-flash-preview';

export const MODELS = [
  { id: 'gemini-3.1-pro-preview', name: 'Model 5.1 (Pro)', description: 'Most capable model for complex tasks' },
  { id: 'gemini-3-flash-preview', name: 'Model 4.0 (Flash)', description: 'Fast and efficient for daily tasks' },
];
