"use client";

import { useState, useEffect } from "react";
import { Post, User, Comment as CommentType } from "@/lib/types/post.types";
import { Avatar } from "@/components/ui/Avatar/Avatar";

interface CommentsProps {
  post: Post;
  currentUser: User | null;
  onCommentAdded: (comment: CommentType) => void;
  isMobile?: boolean;
}

export default function Comments({
  post,
  currentUser,
  onCommentAdded,
  isMobile = false,
}: CommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  // Auto-colapsar en móvil según tu lógica original
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Ahora pasamos un objeto con la estructura que el backend espera.
      // El ID y el Timestamp real los generará la base de datos de NestJS.
      const commentData: any = {
        user: currentUser,
        content: newComment.trim(),
        likes: 0,
        liked: false,
      };

      await onCommentAdded(commentData);

      setNewComment("");

      // En móvil, mantener abiertos los comentarios después de comentar
      if (isMobile) {
        setIsCollapsed(false);
      }
    } catch (error) {
      console.error("Error al enviar comentario:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = (commentId: string, currentlyLiked: boolean) => {
    if (!currentUser) return;
    // Esta lógica se conectará con el backend en la siguiente fase
    console.log(`Comment ${commentId} ${currentlyLiked ? "unliked" : "liked"}`);
  };

  // Formatear timestamp para móvil (Tu lógica original)
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return "";
    if (isMobile) {
      // Manejo de fechas ISO que vienen del backend
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return timestamp;
      return date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return timestamp;
  };

  return (
    <div className="border-t bg-gray-50">
      {/* Botón para expandir/colapsar en móvil - Diseño original */}
      {isMobile && post.comments.length > 0 && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full p-3 bg-gray-100 flex items-center justify-between text-sm text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <span>
            {post.comments.length}{" "}
            {post.comments.length === 1 ? "comentario" : "comentarios"}
          </span>
          <span className="transform transition-transform duration-200">
            {isCollapsed ? "▼" : "▲"}
          </span>
        </button>
      )}

      {/* Lista de comentarios - Diseño original */}
      {((!isMobile && post.comments.length > 0) ||
        (!isCollapsed && post.comments.length > 0)) && (
        <div
          className={`${isMobile ? "p-3" : "p-4 lg:p-6"} space-y-3 lg:space-y-4 max-h-64 lg:max-h-96 overflow-y-auto`}
        >
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex space-x-2 lg:space-x-3">
              <Avatar
                src={comment.user.avatar}
                alt={`Avatar de ${comment.user.name}`}
                size={isMobile ? "xs" : "sm"}
                fallbackLetter={comment.user.name.charAt(0)}
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-lg p-2 lg:p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                    <span className="font-semibold text-xs lg:text-sm text-gray-900 truncate">
                      {comment.user.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(comment.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-800 text-xs lg:text-sm break-words">
                    {comment.content}
                  </p>
                </div>
                <div className="flex items-center space-x-2 lg:space-x-4 mt-1 px-1 lg:px-2">
                  <button
                    onClick={() => handleLikeComment(comment.id, comment.liked)}
                    disabled={!currentUser}
                    className={`text-xs ${
                      !currentUser
                        ? "text-gray-400 cursor-not-allowed"
                        : comment.liked
                          ? "text-red-600 font-medium"
                          : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {isMobile ? "👍" : "Me gusta"}
                  </button>
                  {!isMobile && (
                    <button
                      className="text-xs text-gray-500 hover:text-gray-700"
                      disabled={!currentUser}
                    >
                      Responder
                    </button>
                  )}
                  {comment.likes > 0 && (
                    <span className="text-xs text-gray-500">
                      {isMobile
                        ? `${comment.likes} 👍`
                        : `${comment.likes} me gusta`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario para nuevo comentario - Diseño original */}
      {currentUser ? (
        <div className={`${isMobile ? "p-3" : "p-4 lg:p-6"} border-t`}>
          <form
            onSubmit={handleSubmitComment}
            className="flex space-x-2 lg:space-x-3 items-center"
          >
            <Avatar
              src={currentUser.avatar}
              alt={`Tu avatar`}
              size={isMobile ? "xs" : "sm"}
              fallbackLetter={currentUser.name.charAt(0)}
              className="flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isMobile ? "Escribe..." : "Escribe un comentario..."
                }
                className="w-full border border-gray-300 rounded-full px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm focus:outline-none focus:ring-1 lg:focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="bg-blue-600 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {isSubmitting ? "..." : isMobile ? "➤" : "Comentar"}
            </button>
          </form>
        </div>
      ) : (
        <div className={`${isMobile ? "p-3" : "p-4"} border-t bg-yellow-50`}>
          <p className="text-xs lg:text-sm text-yellow-700 text-center">
            ⚠️{" "}
            {isMobile
              ? "Inicia sesión para comentar"
              : "Inicia sesión para poder comentar"}
          </p>
        </div>
      )}
    </div>
  );
}
