// src/components/posts/PostCard/PostCard.types.ts
import { Post } from '@/lib/types/post.types';

export interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string, content: string) => void;
  onShare?: (postId: string) => void;
}