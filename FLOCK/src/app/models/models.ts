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
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: User;
  participants: User[];
  max_participants?: number;
  telegram_chat_link?: string;
}

// Badge model
export interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
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