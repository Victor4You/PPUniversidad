// src/lib/types/post.types.ts - VERSIÓN FINAL
import { User } from './auth.types';

export type MediaType = 'image' | 'file' | 'link';

export interface Media {
  type: MediaType;
  url: string;
  name?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  voted?: boolean;
}

// SOLO UNA DEFINICIÓN DE Comment
export interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  media?: Media;
  poll?: Poll;
  timestamp: string;
  likes: number;
  liked: boolean;
  comments: Comment[];
  shares: number;
  shared: boolean;
}