// src/hooks/usePosts.ts
"use client";
import { useState, useEffect, useCallback } from "react";
import { Post } from "@/lib/types/post.types";
import { postsService } from "@/services/posts.service";
import { useAuth } from "@/hooks/useAuth";

export function usePosts() {
  // AJUSTE AQUÍ: Añadimos 'user' a la desestructuración
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    if (authLoading) return; // Espera a que la cookie sea leída

    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await postsService.getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error cargando posts", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  const addPost = async (formData: FormData): Promise<Post> => {
    try {
      const newPost = await postsService.createPost(formData);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      console.error("Error creating post:", err);
      throw err;
    }
  };

  const likePost = async (postId: string) => {
    // Ahora 'user' ya está definido y no dará ReferenceError
    if (!user?.id) return;

    try {
      const updatedPost = await postsService.likePost(postId);
      if (updatedPost) {
        setPosts((prev) =>
          prev.map((p) => (p?.id === postId ? updatedPost : p)),
        );
      }
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const commentOnPost = async (postId: string, content: string) => {
    try {
      await postsService.commentOnPost(postId, content);
      // Refrescamos los posts para ver el nuevo comentario
      const data = await postsService.getPosts();
      if (Array.isArray(data)) setPosts(data);
    } catch (err) {
      console.error("Error commenting on post:", err);
    }
  };

  const sharePost = async (postId: string) => {
    try {
      const updatedPost = await postsService.sharePost(postId);
      if (updatedPost) {
        setPosts((prev) =>
          prev.map((p) => (p?.id === postId ? updatedPost : p)),
        );
      }
    } catch (err) {
      console.error("Error sharing post:", err);
    }
  };

  const voteOnPoll = async (postId: string, optionIndex: number) => {
    if (!user?.id) return;
    try {
      const updatedPost = await postsService.votePoll(postId, optionIndex);
      if (updatedPost) {
        setPosts((prev) =>
          prev.map((p) => (p?.id === postId ? updatedPost : p)),
        );
      }
    } catch (err) {
      console.error("Error voting:", err);
    }
  };
  return {
    posts,
    setPosts,
    isLoading: isLoading || authLoading, // 5. Mostramos carga mientras se valida el auth O la petición
    error,
    addPost,
    likePost,
    commentOnPost,
    sharePost,
    voteOnPoll,
    refetch: fetchPosts,
  };
}
