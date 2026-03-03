import api from "@/lib/api/axios";
import { Post, Comment } from "@/lib/types/post.types";

export const postsService = {
  async getPosts(): Promise<Post[]> {
    const response = await api.get<Post[]>("/posts");
    return response.data;
  },

  async createPost(formData: FormData): Promise<Post> {
    const response = await api.post<Post>("/posts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async likePost(postId: string): Promise<Post> {
    const response = await api.post<Post>(`/posts/${postId}/like`);
    return response.data;
  },

  async commentOnPost(postId: string, content: string): Promise<Comment> {
    const response = await api.post<Comment>(`/posts/${postId}/comments`, {
      content,
    });
    return response.data;
  },

  async sharePost(postId: string): Promise<Post> {
    const response = await api.post<Post>(`/posts/${postId}/share`);
    return response.data;
  },

  async votePoll(postId: string, optionIndex: number): Promise<Post> {
    const response = await api.post<Post>(`/posts/${postId}/vote`, {
      optionIndex,
    });
    return response.data;
  },
};
