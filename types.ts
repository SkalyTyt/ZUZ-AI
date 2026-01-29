export enum UserRole {
  GUEST = 'GUEST',
  ADMIN = 'ADMIN'
}

export enum ScreenState {
  AUTH = 'AUTH',
  CHAT = 'CHAT',
  ADMIN = 'ADMIN'
}

export interface User {
  firstName: string;
  lastName: string;
  email?: string;
  role: UserRole;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  description: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}