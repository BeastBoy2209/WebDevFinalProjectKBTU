// User model
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name?: string;
  age?: number;  // Добавляем поле age
  photo?: string; // Добавляем поле photo
  bio?: string;
  telegram_username?: string;
  telegram_id?: number;
  badges?: Badge[];
}

// Event model
export interface Event {
  id: number;
  topic: string; // Изменено с title на topic
  description: string;
  date: string; // Оставляем string, т.к. получаем ISO строку с бэкенда
  location: string;
  // organizer: User; // Поле organizer отсутствует в EventSerializer бэкенда
  participants: User[];
  // max_participants?: number; // Поле отсутствует в EventSerializer бэкенда
  // telegram_chat_link?: string; // Поле отсутствует в EventSerializer бэкенда
  chat?: number; // Добавлено поле chat (ID), если оно есть в EventSerializer
}

// Badge model
export interface Badge {
  id: number;
  name: string;
  description: string; // Добавлено поле описания
  icon: string;        // Добавлено поле для иконки/URL изображения
  type?: string;       // Поле типа (опционально, если есть)
  // ... другие поля, если они есть
}

// Swipe model
export interface SwipeCard {
  id: number;
  type: 'user' | 'event';
  user?: User;
  event?: Event;
}

// Authentication models
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  profileImage?: File;
}

export interface AuthResponse {
  token: string;
  user: User;
}